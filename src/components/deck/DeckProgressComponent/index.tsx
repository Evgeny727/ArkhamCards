import React from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from 'ttag';

import ChangesFromPreviousDeck from './ChangesFromPreviousDeck';
import { Deck, DeckId, ParsedDeck } from '@actions/types';
import { CardsMap } from '@data/types/Card';
import { l, xs } from '@styles/space';
import RoundedFooterButton from '@components/core/RoundedFooterButton';

interface Props {
  deck: Deck;
  cards: CardsMap;
  parsedDeck: ParsedDeck;
  editable: boolean;
  title?: string;
  deckId: DeckId
  onTitlePress?: (deckId: DeckId, deck: ParsedDeck) => void;
  showDeckHistory?: () => void;
  tabooSetId?: number;
  singleCardView?: boolean;
  showBaseDeck?: boolean
}

export default function DeckProgressComponent({
  deck,
  deckId,
  cards,
  parsedDeck,
  editable,
  title,
  onTitlePress,
  showDeckHistory,
  tabooSetId,
  singleCardView,
  showBaseDeck,
}: Props) {
  if (!deck.previousDeckId && !deck.nextDeckId && !title && !editable) {
    return null;
  }
  // Actually compute the diffs.
  return (
    <View style={styles.container}>
      { (!!(deck.previousDeckId) || !!showBaseDeck) && (
        <ChangesFromPreviousDeck
          title={title}
          cards={cards}
          parsedDeck={parsedDeck}
          tabooSetId={tabooSetId}
          singleCardView={singleCardView}
          editable={editable}
          deckId={deckId}
          onTitlePress={onTitlePress}
          footerButton={!deck.nextDeckId && !!deck.previousDeckId && !!showDeckHistory && (
            <RoundedFooterButton
              icon="deck"
              title={t`Upgrade History`}
              onPress={showDeckHistory}
            />
          ) }
        />
      ) }
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginTop: xs,
    marginBottom: l,
  },
});
