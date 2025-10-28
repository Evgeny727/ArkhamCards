import React, { useCallback, useContext, useMemo } from 'react';
import { difference, forEach, find, filter, map, union } from 'lodash';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { t } from 'ttag';
import { RouteProp, useRoute } from '@react-navigation/native';

import PackListComponent from '@components/core/PackListComponent';
import { getAllPacks, getAllRealPacks } from '@reducers';
import COLORS from '@styles/colors';
import StyleContext from '@styles/StyleContext';
import useFilterFunctions from './useFilterFunctions';
import { BasicStackParamList } from '@navigation/types';

const PackFilterView = () => {
  const route = useRoute<RouteProp<BasicStackParamList, 'SearchFilters.Packs'>>();
  const {
    filters,
    onFilterChange,
  } = useFilterFunctions(route.params, {
    title: t`Pack Filters`,
  });
  const { packCodes, packNames } = filters;
  const allRealPacks = useSelector(getAllRealPacks);
  const allPacks = useSelector(getAllPacks);
  const setChecked = useCallback((code: string, value: boolean) => {
    const deltaPacks = filter(allPacks, pack => pack.code === code);
    const deltaPackCodes = map(deltaPacks, pack => pack.code);
    const deltaPackNames = map(deltaPacks, pack => pack.name);
    onFilterChange(
      'packCodes',
      value ? union(packCodes, deltaPackCodes) : difference(packCodes, deltaPackCodes)
    );
    onFilterChange(
      'packNames',
      value ? union(packNames, deltaPackNames) : difference(packNames, deltaPackNames)
    );
  }, [packCodes, packNames, onFilterChange, allPacks]);

  const setCycleChecked = useCallback((cycle_code: string, value: boolean) => {
    const cyclePack = find(allRealPacks, pack => pack.code === cycle_code);
    if (cyclePack) {
      const deltaPacks = filter(allRealPacks, pack => pack.cycle_position === cyclePack.cycle_position);
      const deltaPackCodes = map(deltaPacks, pack => pack.code);
      const deltaPackNames = map(deltaPacks, pack => pack.name);

      onFilterChange(
        'packCodes',
        value ? union(packCodes, deltaPackCodes) : difference(packCodes, deltaPackCodes)
      );
      onFilterChange(
        'packNames',
        value ? union(packNames, deltaPackNames) : difference(packNames, deltaPackNames)
      );
    }
  }, [onFilterChange, packCodes, packNames, allRealPacks]);
  const { backgroundStyle, typography } = useContext(StyleContext);
  const selected = useMemo(() => {
    const selectedPackCodes = new Set(packCodes || []);
    const result: { [pack_code: string]: boolean } = {};
    forEach(allPacks, pack => {
      if (selectedPackCodes.has(pack.code)) {
        result[pack.code] = true;
      }
    });
    return result;
  }, [allPacks, packCodes]);

  if (!allPacks.length) {
    return (
      <View>
        <Text style={typography.text}>{t`Loading`}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.container, backgroundStyle]}>
      <PackListComponent
        coreSetName={t`Core Set`}
        packs={allRealPacks}
        checkState={selected}
        setChecked={setChecked}
        setCycleChecked={setCycleChecked}
      />
    </View>
  );
};
PackFilterView.options = () => {
  return {
    topBar: {
      backButton: {
        title: t`Back`,
        color: COLORS.M,
      },
      title: {
        text: t`Select Packs`,
      },
    },
  };
};
export default PackFilterView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

