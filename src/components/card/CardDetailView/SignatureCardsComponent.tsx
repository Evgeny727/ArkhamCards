import React, { useMemo } from 'react';
import { flatMap, find, map, partition, uniq } from 'lodash';
import {
  View,
} from 'react-native';
import { t } from 'ttag';

import SignatureCardItem from './SignatureCardItem';
import CardDetailSectionHeader from './CardDetailSectionHeader';
import BondedCardsComponent from './BondedCardsComponent';
import Card from '@data/types/Card';
import space from '@styles/space';
import useCardList from '../useCardList';
import specialCards from '@data/deck/specialCards';

interface Props {
  componentId?: string;
  investigator: Card;
  parallelInvestigator?: Card;
  width: number;
}

export default function SignatureCardsComponent({ componentId, investigator, parallelInvestigator, width }: Props) {

  const parallelCodes = useMemo(() => {
    return [
      ...((parallelInvestigator ? specialCards[parallelInvestigator.code]?.front?.codes : undefined) ?? []),
      ...((parallelInvestigator ? specialCards[parallelInvestigator.code]?.back?.codes : undefined) ?? []),
    ];
  }, [parallelInvestigator]);
  const requiredCodes = useMemo(() => {
    return [
      ...flatMap(investigator.deck_requirements?.card || [], req => req.code ? [req.code] : []),
      ...(specialCards[investigator.code]?.front?.codes ?? []),
      ...(specialCards[investigator.code]?.back?.codes ?? []),
      ...parallelCodes,
    ];
  }, [investigator, parallelCodes]);
  const [requiredCards, requiredCardsLoading] = useCardList(requiredCodes, 'player', false);
  const alternateCodes = useMemo(() => {
    return uniq(flatMap(investigator.deck_requirements?.card || [], req => (req.alternates || [])));
  }, [investigator]);
  const [alternateCards, alternateCardsLoading] = useCardList(alternateCodes, 'player', false);
  const bondedCards = useMemo(() => {
    return [
      ...(requiredCards || []),
      ...(alternateCards || []),
    ];
  }, [requiredCards, alternateCards]);
  if (alternateCardsLoading && requiredCardsLoading) {
    return null;
  }

  const [advancedCards, altCards] = partition(alternateCards, card => !!card.advanced);
  const [normalRequiredCards, parallelRequiredCards] = partition(requiredCards, card => !find(parallelCodes, code => card.code === code));
  return (
    <View style={space.marginBottomS}>
      { (normalRequiredCards.length > 0) && (
        <>
          <CardDetailSectionHeader title={t`Required Cards`} />
          { map(normalRequiredCards, card => (
            <SignatureCardItem
              key={card.code}
              componentId={componentId}
              card={card}
              width={width}
            />
          )) }
        </>
      ) }
      { (parallelRequiredCards.length > 0) && (
        <>
          <CardDetailSectionHeader title={t`Parallel Cards`} />
          { map(parallelRequiredCards, card => (
            <SignatureCardItem
              key={card.code}
              componentId={componentId}
              card={card}
              width={width}
            />
          )) }
        </>
      ) }
      { (altCards.length > 0) && (
        <>
          <CardDetailSectionHeader title={t`Alternate Cards`} />
          { map(altCards, card => (
            <SignatureCardItem
              key={card.code}
              componentId={componentId}
              card={card}
              width={width}
            />
          )) }
        </>
      ) }
      { (advancedCards.length > 0) && (
        <>
          <CardDetailSectionHeader title={t`Advanced Cards`} />
          { map(advancedCards, card => (
            <SignatureCardItem
              key={card.code}
              componentId={componentId}
              card={card}
              width={width}
            />
          )) }
        </>
      ) }
      <BondedCardsComponent
        componentId={componentId}
        width={width}
        cards={bondedCards}
      />
    </View>
  );
}
