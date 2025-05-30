import React, { useCallback, useContext, useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { map } from 'lodash';
import { t, msgid, ngettext } from 'ttag';

import { XpCountStep } from '@data/scenario/types';
import GuidedCampaignLog, { CampaignInvestigator } from '@data/scenario/GuidedCampaignLog';
import { CardsMap } from '@data/types/Card';
import StyleContext from '@styles/StyleContext';
import CampaignGuideContext from '../CampaignGuideContext';
import { Deck } from '@actions/types';
import { parseBasicDeck } from '@lib/parseDeck';
import space, { m, s } from '@styles/space';
import CampaignGuideTextComponent from '@components/campaignguide/CampaignGuideTextComponent';
import SetupStepWrapper from '@components/campaignguide/SetupStepWrapper';
import { useLatestDeckCards } from '@components/core/hooks';
import LanguageContext from '@lib/i18n/LanguageContext';
import TraumaSummary from '@components/campaign/TraumaSummary';
import CollapsibleFactionBlock from '@components/core/CollapsibleFactionBlock';
import CompactInvestigatorRow from '@components/core/CompactInvestigatorRow';
import MiniPickerStyleButton from '@components/deck/controls/MiniPickerStyleButton';

interface Props {
  step: XpCountStep;
  campaignLog: GuidedCampaignLog;
}

function SpentDeckXpComponent({ deck, campaignLog, previousDeck, playerCards, children }: {
  deck: Deck;
  campaignLog: GuidedCampaignLog;
  previousDeck: Deck;
  playerCards?: CardsMap;
  children: (xp: number) => JSX.Element | null;
}) {
  const { listSeperator } = useContext(LanguageContext);
  const parsedDeck = useMemo(
    () => playerCards ? parseBasicDeck(deck, playerCards, listSeperator, previousDeck) : undefined,
    [deck, playerCards, previousDeck, listSeperator]);
  const earnedXp = campaignLog.earnedXp(deck.investigator_code);
  if (!parsedDeck || !playerCards) {
    return children(earnedXp);
  }
  const { changes } = parsedDeck;
  const availableXp = (deck.xp || 0) + (deck.xp_adjustment || 0) - (changes?.spentXp || 0) + earnedXp;
  return children(availableXp);
}

function SpentXpComponent({ investigator, campaignLog, children }: {
  investigator: CampaignInvestigator;
  campaignLog: GuidedCampaignLog;
  children: (xp: number) => JSX.Element | null;
}) {
  const { latestDecks, spentXp } = useContext(CampaignGuideContext);
  const deck = latestDecks[investigator.code];
  const earnedXp = campaignLog.earnedXp(investigator.code);
  const [playerCards] = useLatestDeckCards(deck, false);
  if (deck) {
    if (!deck.previousDeck) {
      return children(earnedXp);
    }
    return (
      <SpentDeckXpComponent
        deck={deck.deck}
        playerCards={playerCards}
        campaignLog={campaignLog}
        previousDeck={deck.previousDeck}
      >
        { children }
      </SpentDeckXpComponent>
    );
  }
  return children(earnedXp + campaignLog.totalXp(investigator.code) - (spentXp[investigator.code] || 0));
}

function InvestigatorXpComponent({ investigator, campaignLog, width, resupplyPointsString }: { investigator: CampaignInvestigator; campaignLog: GuidedCampaignLog; width: number; resupplyPointsString: string | undefined }) {
  const { typography } = useContext(StyleContext);
  const trauma = campaignLog.traumaAndCardData(investigator.code);
  const hasTrauma = (trauma.physical || 0) > 0 || (trauma.mental || 0) > 0;
  const renderXpHeader = useCallback((xp: number) => {
    return () => (
      <CompactInvestigatorRow
        investigator={investigator.card}
        width={width - s * 2}
        open={hasTrauma}
      >
        <View style={[{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }]}>
          <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text numberOfLines={2} ellipsizeMode="head" style={[typography.button, investigator ? typography.white : undefined]} >
              { ngettext(
                msgid`${xp} general / ${resupplyPointsString} XP`,
                `${xp} general / ${resupplyPointsString} XP`,
                xp
              )}
            </Text>
          </View>
        </View>
      </CompactInvestigatorRow>
    );
  }, [typography, hasTrauma, investigator, resupplyPointsString, width]);
  return (
    <View key={investigator.code} style={[space.paddingSideS, space.paddingBottomS]}>
      <SpentXpComponent investigator={investigator} campaignLog={campaignLog}>
        { (xp: number) => (
          <CollapsibleFactionBlock
            faction={investigator.card.factionCode()}
            renderHeader={renderXpHeader(xp)}
            open={hasTrauma}
            disabled
            noShadow
          >
            { !!hasTrauma && (
              <View style={space.paddingS}>
                <MiniPickerStyleButton
                  title={t`Trauma`}
                  valueLabel={<TraumaSummary trauma={trauma} investigator={investigator} />}
                  first
                  last
                  editable={false}
                />
              </View>
            ) }
          </CollapsibleFactionBlock>
        ) }
      </SpentXpComponent>
    </View>
  );
}

export default function XpCountComponent({ step, campaignLog }: Props) {
  const { colors, typography, width } = useContext(StyleContext);
  const specialString = useCallback((investigator: CampaignInvestigator) => {
    const count = campaignLog.specialXp(investigator.code, step.special_xp);
    switch (step.special_xp) {
      case 'resupply_points':
        return ngettext(msgid`${count} resupply`,
          `${count} resupply`,
          count);
      case 'supply_points':
        return ngettext(msgid`${count} supply point`,
          `${count} supply points`,
          count);
      default:
        return undefined;
    }
  }, [step, campaignLog]);
  return (
    <>
      { !!step.title && (
        <View style={styles.titleWrapper}>
          <Text style={[
            typography.bigGameFont,
            { color: colors.darkText },
            space.paddingTopL,
          ]}>
            { step.title }
          </Text>
        </View>
      ) }
      { !!step.text && (
        <SetupStepWrapper bulletType={step.bullet_type}>
          <CampaignGuideTextComponent text={step.text} />
        </SetupStepWrapper>
      )}
      { map(campaignLog.investigators(false), (investigator) => {
        const resupplyPointsString = specialString(investigator);
        return (
          <InvestigatorXpComponent
            key={investigator.code}
            investigator={investigator}
            width={width}
            campaignLog={campaignLog}
            resupplyPointsString={resupplyPointsString}
          />
        );
      })}
    </>
  );
}


const styles = StyleSheet.create({
  titleWrapper: {
    marginLeft: m,
    marginRight: m + s,
  },
});
