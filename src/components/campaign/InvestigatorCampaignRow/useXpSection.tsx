import React, { useCallback, useContext, useMemo } from 'react';
import { t } from 'ttag';

import { Deck } from '@actions/types';
import { showDeckModal } from '@components/nav/helper';
import { parseBasicDeck } from '@lib/parseDeck';
import MiniPickerStyleButton from '@components/deck/controls/MiniPickerStyleButton';
import MiniCampaignT from '@data/interfaces/MiniCampaignT';
import LatestDeckT from '@data/interfaces/LatestDeckT';
import ArkhamCardsAuthContext from '@lib/ArkhamCardsAuthContext';
import { useLatestDeckCards } from '@components/core/hooks';
import LanguageContext from '@lib/i18n/LanguageContext';
import { CampaignInvestigator } from '@data/scenario/GuidedCampaignLog';
import { useNavigation } from '@react-navigation/native';
import StyleContext from '@styles/StyleContext';

interface Props {
  deck?: LatestDeckT;
  campaign: MiniCampaignT;
  investigator: CampaignInvestigator;
  showDeckUpgrade?: (investigator: CampaignInvestigator, deck: Deck) => void;
  editXpPressed?: () => void;

  unspentXp: number;
  spentXp: number;
  totalXp: number;
  last?: boolean;
  isDeckOwner: boolean;
  uploading: boolean;
}

export default function useXpSection({
  deck,
  campaign,
  investigator,
  last,
  spentXp,
  totalXp,
  unspentXp,
  isDeckOwner,
  uploading,
  showDeckUpgrade,
  editXpPressed,
}: Props): [React.ReactNode, boolean] {
  const { userId } = useContext(ArkhamCardsAuthContext);
  const { colors } = useContext(StyleContext);
  const showDeckUpgradePress = useCallback(() => {
    if (deck && showDeckUpgrade) {
      showDeckUpgrade(investigator, deck.deck);
    }
  }, [investigator, deck, showDeckUpgrade]);
  const navigation = useNavigation();

  const onPress = useCallback(() => {
    if (deck) {
      showDeckModal(
        navigation,
        colors,
        deck.id,
        deck.deck,
        campaign?.id,
        investigator.card,
        'upgrade',
      );
    }
  }, [navigation, colors, campaign, deck, investigator]);
  const ownerDeck = !deck?.owner || !userId || deck.owner.id === userId;
  const [cards] = useLatestDeckCards(deck, false);
  const { listSeperator } = useContext(LanguageContext);
  const parsedDeck = useMemo(() => {
    if (!deck || uploading || !cards) {
      return undefined;
    }
    if (!deck.previousDeck && !showDeckUpgrade) {
      return undefined;
    }
    return parseBasicDeck(deck.deck, cards, listSeperator, deck.previousDeck);
  }, [deck, uploading, listSeperator, showDeckUpgrade, cards]);
  if (deck && !uploading) {
    if (!parsedDeck) {
      if (unspentXp > 0) {
        return [
          <MiniPickerStyleButton
            key="unspent"
            title={t`Unspent XP`}
            valueLabel={t`${unspentXp} saved`}
            last={last && !showDeckUpgrade}
            editable={false}
          />,
          false,
        ];
      }
      return [null, false];
    }
    const { changes } = parsedDeck;
    if (!changes && !showDeckUpgrade) {
      return [null, false];
    }
    const spentXp = changes?.spentXp || 0;
    const totalXp = (deck.deck.xp || 0) + (deck.deck.xp_adjustment || 0);
    return [(
      <>
        <MiniPickerStyleButton
          key="xp"
          title={unspentXp > 0 ? t`Available XP` : t`Experience`}
          valueLabel={t`${spentXp} of ${totalXp} spent`}
          last={last && !unspentXp && !showDeckUpgrade}
          editable={isDeckOwner && !uploading}
          onPress={onPress}
        />
        { unspentXp > 0 && (
          <MiniPickerStyleButton
            key="unspent"
            title={t`Unspent XP`}
            valueLabel={t`${unspentXp} saved`}
            last={last && !showDeckUpgrade}
            editable={false}
          />
        )}
        { !!showDeckUpgrade && (
          <MiniPickerStyleButton
            key="upgrade"
            title={t`Upgrade Deck`}
            valueLabel={t`Add XP from scenario`}
            icon="upgrade"
            onPress={showDeckUpgradePress}
            last={last}
            editable={!uploading}
          />
        ) }
      </>
    ), ownerDeck && spentXp === 0 && unspentXp === 0 && totalXp !== 0];
  }
  if (totalXp === 0 && unspentXp === 0) {
    return [null, false];
  }
  return [(
    <>
      { totalXp > 0 && (
        <MiniPickerStyleButton
          key="xp"
          title={unspentXp > 0 ? t`Available XP` : t`Experience`}
          valueLabel={t`${spentXp} of ${totalXp} spent` }
          last={last && !unspentXp}
          editable={!uploading}
          onPress={editXpPressed}
        />
      )}
      { unspentXp > 0 && (
        <MiniPickerStyleButton
          key="unspent"
          title={t`Unspent XP`}
          valueLabel={t`${unspentXp} saved`}
          last={last && !showDeckUpgrade}
          editable={false}
        />
      )}
    </>
  ), false];
}
