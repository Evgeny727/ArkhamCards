import React, { useCallback, useContext, useEffect, useMemo, useState, useReducer } from 'react';
import { flatMap, keys, map, sortBy } from 'lodash';
import { StyleSheet, ListRenderItemInfo, View, Platform } from 'react-native';
import { t } from 'ttag';
import { Brackets } from 'typeorm/browser';
import Animated from 'react-native-reanimated';

import { TouchableOpacity } from '@components/core/Touchables';
import Rule from '@data/types/Rule';
import CardFlavorTextComponent from '@components/card/CardFlavorTextComponent';
import CardTextComponent from '@components/card/CardTextComponent';
import { s, m } from '@styles/space';
import DatabaseContext from '@data/sqlite/DatabaseContext';
import { Navigation } from 'react-native-navigation';
import { RuleViewProps } from './RuleView';
import { searchBoxHeight } from '@components/core/SearchBox';
import CollapsibleSearchBox from '@components/core/CollapsibleSearchBox';
import { where } from '@data/sqlite/query';
import LanguageContext from '@lib/i18n/LanguageContext';
import { searchNormalize } from '@data/types/Card';
import StyleContext from '@styles/StyleContext';
import { usePressCallback } from '@components/core/hooks';
import ArkhamLoadingSpinner from '@components/core/ArkhamLoadingSpinner';

interface Props {
  componentId: string;
}

function RuleComponent({ componentId, rule, level }: { componentId: string; rule: Rule; level: number }) {
  const { listSeperator } = useContext(LanguageContext);
  const onPressRaw = useCallback(() => {
    Navigation.push<RuleViewProps>(componentId, {
      component: {
        name: 'Rule',
        passProps: {
          rule,
        },
        options: {
          topBar: {
            title: {
              component: {
                name: 'RulesTitle',
                alignment: 'center',
                passProps: {
                  title: rule.title,
                },
              },
            },
            backButton: {
              title: t`Back`,
            },
          },
        },
      },
    });
  }, [componentId, rule]);
  const onPress = usePressCallback(onPressRaw);
  return (
    <View key={rule.id} style={{ paddingLeft: s + s * (level + 1), paddingRight: m, marginTop: s }}>
      <TouchableOpacity onPress={onPress}>
        <CardFlavorTextComponent text={`<game>${rule.title}</game>`} sizeScale={1.2} />
        { !!(rule.rules && rule.rules.length > 0) && (
          <CardTextComponent text={map(rule.rules || [], subRule => subRule.title).join(listSeperator)} />
        ) }
      </TouchableOpacity>
    </View>
  );
}

const PAGE_SIZE = 50;
interface PagedRules {
  rules: { [page: string]: Rule[] };
  endReached: boolean;
}

interface AppendPagedRules {
  rules: Rule[];
  page: number;
}

interface SearchResults {
  rules: Rule[];
  term: string;
}


export default function RulesView({ componentId }: Props) {
  const { db } = useContext(DatabaseContext);
  const { lang } = useContext(LanguageContext);
  const { fontScale, height } = useContext(StyleContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    term: '',
    rules: [],
  });
  const updateSearch = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
    if (searchTerm === searchResults.term) {
      return;
    }
    if (!searchTerm) {
      setSearchResults({
        term: '',
        rules: [],
      });
    }
    db.getRulesPaged(
      0,
      100,
      where(`r.parentRule is null AND (r.s_title LIKE '%' || :titleSearchTerm || '%' OR r.text LIKE '%' || :searchTerm || '%' OR (sub_rules.s_title is not null AND sub_rules.s_title LIKE '%' || :titleSearchTerm || '%') OR (sub_rules.text is not null AND sub_rules.text LIKE '%' || :searchTerm || '%'))`, { searchTerm, titleSearchTerm: searchNormalize(searchTerm.trim(), lang) })
    ).then((rules: Rule[]) => setSearchResults({
      term: searchTerm,
      rules,
    }), console.log);
  }, [db, lang, searchResults.term]);
  const [rules, appendRules] = useReducer(
    (state: PagedRules, action: AppendPagedRules): PagedRules => {
      return {
        rules: {
          ...state.rules,
          [action.page]: action.rules,
        },
        endReached: state.endReached || action.rules.length < PAGE_SIZE,
      };
    }, {
      rules: {},
      endReached: false,
    });
  const [, fetchPage] = useReducer((page: number) => {
    if (!rules.endReached) {
      db.getRulesPaged(
        page,
        PAGE_SIZE,
        new Brackets(qb => qb.where('r.parentRule is null'))
      ).then((rules: Rule[]) => appendRules({ rules, page }), console.log);
      return page + 1;
    }
    return page;
  }, 0);

  useEffect(() => {
    // Fetch the initial page.
    fetchPage();
  }, []);

  const fetchMore = useCallback(() => {
    if (!rules.endReached) {
      fetchPage();
    }
  }, [rules.endReached, fetchPage]);
  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<Rule>) => {
    return <RuleComponent componentId={componentId} key={index} rule={item} level={0} />;
  }, [componentId]);
  const data = useMemo(() => searchTerm ? searchResults.rules : flatMap(
    sortBy(keys(rules.rules), parseInt),
    idx => rules.rules[idx]
  ), [searchTerm, searchResults, rules]);
  const searchBarHeight = searchBoxHeight(fontScale);
  return (
    <CollapsibleSearchBox
      prompt={t`Search rules`}
      searchTerm={searchTerm}
      onSearchChange={updateSearch}
    >
      { (onScroll) => (
        <Animated.FlatList
          onScroll={onScroll}
          data={data}
          contentInset={Platform.OS === 'ios' ? { top: searchBarHeight } : undefined}
          contentOffset={Platform.OS === 'ios' ? { x: 0, y: -searchBarHeight } : undefined}
          renderItem={renderItem}
          onEndReachedThreshold={searchBarHeight}
          onEndReached={fetchMore}
          updateCellsBatchingPeriod={50}
          initialNumToRender={30}
          maxToRenderPerBatch={30}
          windowSize={30}
          ListHeaderComponent={(Platform.OS === 'android') ? (
            <View style={{ height: searchBarHeight }} />
          ) : undefined}
          ListFooterComponent={
            <View style={[styles.footer, { height: height / 2 }]}>
              { rules.endReached ? null : <ArkhamLoadingSpinner autoPlay loop />}
            </View>
          }
        />
      ) }
    </CollapsibleSearchBox>
  );
}


const styles = StyleSheet.create({
  footer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
