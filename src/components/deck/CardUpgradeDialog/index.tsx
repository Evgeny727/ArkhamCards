import React, { useCallback, useContext, useMemo, useState, useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@navigation/types';
import { getDeckScreenOptions } from '@components/nav/helper';

import { forEach, filter, find, map, reverse, partition, sortBy, sumBy, shuffle, flatMap, uniq, range } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { t, ngettext, msgid } from 'ttag';

import BasicButton from '@components/core/BasicButton';
import CardTextComponent from '@components/card/CardTextComponent';
import CardUpgradeOption from './CardUpgradeOption';
import CardDetailComponent from '@components/card/CardDetailView/CardDetailComponent';
import { incIgnoreDeckSlot, decIgnoreDeckSlot, incDeckSlot, decDeckSlot, setDeckXpAdjustment } from '@components/deck/actions';
import DeckValidation from '@lib/DeckValidation';
import Card, { CardsMap, InvestigatorChoice, cardInCollection } from '@data/types/Card';
import space, { m } from '@styles/space';
import DeckNavFooter, { FOOTER_HEIGHT } from '@components/deck/DeckNavFooter';
import { getPacksInCollection } from '@reducers';
import StyleContext from '@styles/StyleContext';
import { PARALLEL_SKIDS_CODE, PARALLEL_AGNES_CODE, SHREWD_ANALYSIS_CODE, UNIDENTIFIED_UNTRANSLATED } from '@app_constants';
import ArkhamButton from '@components/core/ArkhamButton';
import CardSearchResult from '@components/cardlist/CardSearchResult';
import { useSimpleDeckEdits } from '@components/deck/hooks';
import { useSettingValue } from '@components/core/hooks';
import DeckProblemBanner from '../DeckProblemBanner';
import { useDialog } from '../dialogs';
import { NOTCH_BOTTOM_PADDING } from '@styles/sizes';
import { DeckId } from '@actions/types';
import { parseMetaSlots } from '@lib/parseDeck';
import { useCardMap } from '@components/card/useCardList';
import { useDeck } from '@data/hooks';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export interface CardUpgradeDialogProps {
  id: DeckId;
  cardsByName: Card[];
  investigator: InvestigatorChoice;
  mode: 'extra' | undefined;
  cardName?: string;
}

function ignoreRule(code: string) {
  switch (code) {
    case PARALLEL_SKIDS_CODE:
      return {
        text: t`<b>Additional Options</b>: When you upgrade a [[Fortune]] or [[Gambit]] card, you may instead pay the full experience cost on the higher level version and leave the lower level version in your deck (it does not count towards your deck size or the number of copies of that card in your deck).`,
        traits: ['#gambit#', '#fortune#'],
      };
    case PARALLEL_AGNES_CODE:
      return {
        text: t`<b>Additional Options</b>: When you upgrade a [[Spell]], you may instead pay the full experience cost on the higher level version and leave the lower level version in your deck (it does not count towards your deck size or the number of copies of that card in your deck).`,
        traits: ['#spell#'],
      };
    default:
      return undefined;
  }
}

export default function CardUpgradeDialog() {
  const route = useRoute<RouteProp<RootStackParamList, 'Dialog.CardUpgrade'>>();
  const navigation = useNavigation();
  const { cardsByName, investigator, id, mode, cardName } = route.params;
  const cards = useMemo(() => {
    const r: CardsMap = {};
    forEach(cardsByName, c => {
      r[c.code] = c;
    });
    return r;
  }, [cardsByName]);
  const deck = useDeck(id);
  const deckEdits = useSimpleDeckEdits(id);
  const slots = useMemo(() => mode === 'extra' ? deckEdits?.meta && parseMetaSlots(deckEdits?.meta.extra_deck) : deckEdits?.slots, [mode, deckEdits]);
  const codes = useMemo(() => Object.keys(slots ?? {}), [slots]);
  const [deckCardsMap] = useCardMap(codes, 'player', false, deckEdits?.tabooSetChange ?? deck?.deck.taboo_id ?? 0);
  const deckCards = useMemo(() => {
    const result: Card[] = [];
    forEach(slots, (count, code) => {
      const card = deckCardsMap[code];
      if (card && count > 0) {
        range(0, count).forEach(() => {
          result.push(card);
        });
      }
    })
    return result;
  }, [deckCardsMap, slots]);
  const originalCodes = useMemo(() => {
    if (!slots) {
      return new Set();
    }
    return new Set(map(filter(cardsByName, c => !!slots[c.code]), c => c.code));
    // Intentionally only updating when we gain/lose slot changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, cardsByName]);
  const dispatch = useDispatch();
  const { backgroundStyle, borderStyle, typography, width, colors } = useContext(StyleContext);
  const inCollection = useSelector(getPacksInCollection);
  const ignore_collection = useSettingValue('ignore_collection');
  const [showNonCollection, setShowNonCollection] = useState(false);
  const [shrewdAnalysisResult, setShrewdAnalysisResult] = useState<string[]>([]);

  useLayoutEffect(() => {
    if (investigator) {
      const screenOptions = getDeckScreenOptions(
        colors,
        { title: cardName || t`Card Upgrade` },
        investigator.front
      );
      navigation.setOptions(screenOptions);
    }
  }, [navigation, colors, investigator, cardName]);

  const backPressed = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const dedupedCardsByName = useMemo(() => {
    const reprints = filter(cardsByName, c => !!c.duplicate_of_code);
    const cardsToDrop = new Set(map(reprints, c => {
      if (originalCodes.has(c.code)) {
        return c.duplicate_of_code;
      }
      return c.code;
    }));
    return filter(cardsByName, c => !cardsToDrop.has(c.code));
  }, [cardsByName, originalCodes]);

  const namedCards = useMemo(() => {
    if (!slots || !deckEdits) {
      return [];
    }
    const validation = new DeckValidation(investigator, slots, deckEdits.meta, { extra_deck: mode === 'extra' });
    return sortBy(
      filter(dedupedCardsByName,
        card => validation.canIncludeCard(card, false, deckCards)),
      card => card.xp || 0
    );
  }, [dedupedCardsByName, deckCards, investigator, deckEdits, slots, mode]);
  const onIncrementIgnore = useCallback((code: string) => {
    dispatch(incIgnoreDeckSlot(id, code));
  }, [dispatch, id]);

  const onDecrementIgnore = useCallback((code: string) => {
    dispatch(decIgnoreDeckSlot(id, code));
  }, [dispatch, id]);

  const ignoreData = useMemo(() => ignoreRule(investigator.back.code), [investigator.back.code]);

  const onIncrement = useCallback((code: string) => {
    if (!deckEdits || !slots) {
      return;
    }
    const possibleDecrement = find(reverse(namedCards), card => {
      return (
        card.code !== code && slots[card.code] > 0 &&
        (mode === 'extra' || (deckEdits.ignoreDeckLimitSlots[card.code] || 0) < slots[card.code]) &&
        !!cards &&
        (card.xp || 0) < (cards[code]?.xp || 0)
      );
    });
    const card = cards[code];
    dispatch(incDeckSlot(id, code, card?.deck_limit, mode));
    if ((
      !ignoreData ||
      !card ||
      !find(ignoreData.traits, trait => !!(card.real_traits_normalized && card.real_traits_normalized.indexOf(trait) !== -1))
    ) && possibleDecrement) {
      dispatch(decDeckSlot(id, possibleDecrement.code, mode));
    }
  }, [mode, slots, deckEdits, dispatch, cards, namedCards, ignoreData, id]);

  const onDecrement = useCallback((code: string) => {
    dispatch(decDeckSlot(id, code, mode));
  }, [dispatch, id, mode]);

  const overLimit = useMemo(() => {
    if (!deckEdits || !slots) {
      return false;
    }
    const limit = mode === 'extra' ? 1 : (
      (namedCards && namedCards.length) ?
        (namedCards[0].deck_limit || 2) :
        2
    );
    return sumBy(namedCards, card => (slots[card.code] || 0) - (deckEdits.ignoreDeckLimitSlots[card.code] || 0)) > limit;
  }, [mode, slots, deckEdits, namedCards]);

  const showNonCollectionPressed = useCallback(() => {
    setShowNonCollection(true);
  }, [setShowNonCollection]);

  const isCardInCollection = useCallback((card: Card): boolean => {
    return (
      (card.pack_code === 'core' && !inCollection.no_core) ||
      ignore_collection ||
      showNonCollection ||
      cardInCollection(card, inCollection)
    );
  }, [inCollection, showNonCollection, ignore_collection]);


  const specialIgnoreRule = useCallback((card: Card, highestLevel: boolean) => {
    return (!!ignoreData &&
      !highestLevel &&
      !!find(ignoreData.traits, trait => !!(card.real_traits_normalized && card.real_traits_normalized.indexOf(trait) !== -1))
    );
  }, [ignoreData]);
  const shrewdAnalysisRule = useCallback((card: Card) => {
    if (!deckEdits) {
      return false;
    }
    return (deckEdits.slots[SHREWD_ANALYSIS_CODE] > 0) && UNIDENTIFIED_UNTRANSLATED.has(card.code);
  }, [deckEdits]);
  const renderCard = useCallback((card: Card, highestLevel: boolean) => {
    const allowIgnore = !mode && specialIgnoreRule(card, highestLevel);
    return (
      <View style={[styles.column, borderStyle]} key={card.code}>
        <CardUpgradeOption
          key={card.code}
          card={card}
          code={card.code}
          count={slots?.[card.code] || 0}
          ignoreCount={!mode ? deckEdits?.ignoreDeckLimitSlots[card.code] || 0 : 0}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onIgnore={allowIgnore ? {
            onIncrement: onIncrementIgnore,
            onDecrement: onDecrementIgnore,
          } : undefined}
        />
        <CardDetailComponent
          card={card}
          showSpoilers
          width={width}
          simple
        />
      </View>
    );
  }, [mode, slots, deckEdits?.ignoreDeckLimitSlots, borderStyle, width,
    specialIgnoreRule, onIncrementIgnore, onDecrementIgnore, onIncrement, onDecrement]);

  const doShrewdAnalysis = useCallback(() => {
    if (!deckEdits || !slots) {
      return;
    }
    const [inCollection] = partition(
      namedCards,
      card => isCardInCollection(card) || slots[card.code] > 0);
    const [baseCards, eligibleCards] = partition(inCollection, card => shrewdAnalysisRule(card));
    if (eligibleCards.length && baseCards.length) {
      const baseCard = baseCards[0];
      const firstCard = shuffle(eligibleCards)[0];
      const secondCard = shuffle(eligibleCards)[0];
      const xpCost = (firstCard.xp || 0) + (firstCard.extra_xp || 0) - ((baseCard.xp || 0) + (baseCard.extra_xp || 0));
      dispatch(decDeckSlot(id, baseCard.code));
      dispatch(decDeckSlot(id, baseCard.code));
      dispatch(incDeckSlot(id, firstCard.code, firstCard.deck_limit));
      dispatch(incDeckSlot(id, secondCard.code, secondCard.deck_limit));
      setShrewdAnalysisResult([firstCard.code, secondCard.code]);
      dispatch(setDeckXpAdjustment(id, deckEdits.xpAdjustment + xpCost));
    }
  }, [deckEdits, namedCards, slots, dispatch, id, isCardInCollection, shrewdAnalysisRule]);

  const shrewdAnalysisContent = useMemo(() => {
    if (!deckEdits) {
      return;
    }
    const [inCollection] = partition(namedCards, card => isCardInCollection(card) || deckEdits.slots[card.code] > 0);
    const [baseCards, eligibleCards] = partition(inCollection, card => shrewdAnalysisRule(card));
    if (eligibleCards.length && baseCards.length) {
      const baseCard = baseCards[0];
      const sampleCard = eligibleCards[0];
      const xpCost = (sampleCard.xp || 0) + (sampleCard.extra_xp || 0) - ((baseCard.xp || 0) + (baseCard.extra_xp || 0));
      const upgradeCardsArray = map(eligibleCards, eligibleCards => `\t- ${eligibleCards.subname || eligibleCards.name}`);
      const upgradeCards = upgradeCardsArray.join('\n');
      return (
        <View style={[space.paddingTopM, space.paddingBottomM, space.paddingSideS]}>
          <Text style={[typography.text, space.paddingBottomS]}>
            { ngettext(
              msgid`This upgrade will cost ${xpCost} experience.`,
              `This upgrade will cost ${xpCost} experience.`,
              xpCost
            ) }
          </Text>
          <Text style={[typography.text, space.paddingBottomM]}>
            { ngettext(
              msgid`Two random cards will be chosen among the following choice:\n\n${upgradeCards}`,
              `Two random cards will be chosen among the following choices:\n\n${upgradeCards}`,
              upgradeCardsArray.length
            ) }
          </Text>
          <Text style={typography.text}>
            { t`You can edit your collection under Settings to adjust the eligible choices.` }
          </Text>
        </View>
      );
    }
    return null;
  }, [typography, isCardInCollection, deckEdits, namedCards, shrewdAnalysisRule]);

  const { dialog: shrewdAnalysisDialog, setVisible: setShrewdAnalysisDialogVisible } = useDialog({
    title: t`Shrewd Analysis Rule`,
    content: shrewdAnalysisContent,
    confirm: {
      title: t`Upgrade`,
      onPress: doShrewdAnalysis,
    },
    dismiss: {
      title: t`Cancel`,
    },
  });

  const askShrewdAnalysis = useCallback(() => {
    setShrewdAnalysisDialogVisible(true);
  }, [setShrewdAnalysisDialogVisible]);

  const shrewdAnalysisCards: Card[] = useMemo(() => {
    return flatMap(uniq(shrewdAnalysisResult), code => {
      const card = cards && cards[code];
      return card ? [card] : [];
    });
  }, [shrewdAnalysisResult, cards]);

  const cardsSection = useMemo(() => {
    if (!deckEdits || !slots) {
      return null;
    }
    const [inCollection, nonCollection] = partition(
      namedCards,
      card => isCardInCollection(card) || slots[card.code] > 0);
    const cards = map(inCollection, card => {
      return {
        card,
        highestLevel: !find(inCollection, c => (c.xp || 0) > (card.xp || 0)),
      };
    });
    const ignoreRule = !!find(cards, ({ card, highestLevel }) => specialIgnoreRule(card, highestLevel));
    const hasShrewdAnalysisRule = !!find(cards, ({ card }) => shrewdAnalysisRule(card) && deckEdits.slots[card.code] >= 2);
    return (
      <>
        { ignoreRule && !!ignoreData && (
          <View style={space.paddingM}>
            <CardTextComponent text={ignoreData.text} />
          </View>
        ) }
        { (!mode && (hasShrewdAnalysisRule || !!shrewdAnalysisCards.length)) && (
          <>
            <View style={space.paddingM}>
              <CardTextComponent
                text={t`<b>Shrewd Analysis</b>: If you meet the campaign conditions, you may use Shrewd Analysis to choose both upgrades randomly and only pay for one.\n\n<i>Note: the app handles this by adjusting experience to account for the 'free' upgrade.</i>` }
              />
            </View>
            { shrewdAnalysisCards.length ? (
              <>
                <View style={[styles.shrewdAnalysisResults, borderStyle]}>
                  <Text style={[typography.text, typography.light, typography.right, space.paddingS, space.paddingRightM]}>
                    { t`Upgrade results` }
                  </Text>
                </View>
                { map(shrewdAnalysisCards, (card, idx) => (
                  <CardSearchResult
                    key={idx}
                    card={card}
                    control={{
                      type: 'count',
                      count: deckEdits.slots[card.code] || 0,
                    }}
                  />
                )) }
              </>
            ) : (
              <ArkhamButton title={t`Upgrade with Shrewd Analysis`} icon="up" onPress={askShrewdAnalysis} />
            ) }
          </>
        ) }
        { map(cards, ({ card, highestLevel }) => renderCard(card, highestLevel)) }
        { nonCollection.length > 0 ? (
          <BasicButton
            key="non-collection"
            title={ngettext(
              msgid`Show ${nonCollection.length} non-collection card`,
              `Show ${nonCollection.length} non-collection cards`,
              nonCollection.length
            )}
            onPress={showNonCollectionPressed}
          />
        ) : null }
      </>
    );
  }, [mode, slots, deckEdits, borderStyle, namedCards, typography, shrewdAnalysisCards, isCardInCollection, specialIgnoreRule, ignoreData, shrewdAnalysisRule, askShrewdAnalysis, renderCard, showNonCollectionPressed]);
  return (
    <View
      style={[styles.wrapper, backgroundStyle]}
    >
      <ScrollView
        overScrollMode="never"
        bounces={false}
      >
        { cardsSection }
        <View style={styles.footerPadding} />
      </ScrollView>
      <DeckNavFooter deckId={id} onPress={backPressed} mode={mode} />
      { overLimit && (
        <DeckProblemBanner problem={{ reason: 'too_many_copies', invalidCards: [] }} />
      ) }
      { shrewdAnalysisDialog }
    </View>
  );
}

function options<T extends RootStackParamList>({ route }: { route: RouteProp<T, 'Dialog.CardUpgrade'> }): NativeStackNavigationOptions {
  return {
    title: route.params?.cardName || t`Card Upgrade`,
  };
};
CardUpgradeDialog.options = options;

const styles = StyleSheet.create({
  column: {
    paddingTop: m,
    paddingBottom: m,
    flexDirection: 'column',
    borderBottomWidth: 1,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  footerPadding: {
    height: FOOTER_HEIGHT + NOTCH_BOTTOM_PADDING,
  },
  shrewdAnalysisResults: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
