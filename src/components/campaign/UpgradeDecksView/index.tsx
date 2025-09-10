import React, { useCallback, useContext, useRef } from 'react';
import { map } from 'lodash';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { t } from 'ttag';

import BasicButton from '@components/core/BasicButton';
import { CampaignId, Deck, getDeckId, ScenarioResult } from '@actions/types';
import { NavigationProps } from '@components/nav/types';
import { getLangPreference } from '@reducers';
import { iconsMap } from '@app/NavIcons';
import COLORS from '@styles/colors';
import { updateCampaignXp } from '@components/campaign/actions';
import UpgradeDecksList from './UpgradeDecksList';
import { UpgradeDeckProps } from '@components/deck/DeckUpgradeDialog';
import space, { s } from '@styles/space';
import StyleContext from '@styles/StyleContext';
import { useNavigationButtonPressed } from '@components/core/hooks';
import { useCampaign, useCampaignInvestigators } from '@data/hooks';
import { useUpdateCampaignActions } from '@data/remote/campaigns';
import LatestDeckT from '@data/interfaces/LatestDeckT';
import { useAppDispatch } from '@app/store';
import { CampaignInvestigator } from '@data/scenario/GuidedCampaignLog';

export interface UpgradeDecksProps {
  id: CampaignId;
  // eslint-disable-next-line react/no-unused-prop-types
  scenarioResult: ScenarioResult;
}

const EMPTY_DECKS: LatestDeckT[] = [];

function UpgradeDecksView({ componentId, id }: UpgradeDecksProps & NavigationProps) {
  const { backgroundStyle, colors, typography } = useContext(StyleContext);
  const dispatch = useAppDispatch();
  const campaign = useCampaign(id);
  const [allInvestigators] = useCampaignInvestigators(campaign);
  const latestDecks = campaign?.latestDecks() ?? EMPTY_DECKS;
  const lang = useSelector(getLangPreference);
  const updateCampaignActions = useUpdateCampaignActions();
  const originalDeckUuids = useRef(new Set(map(latestDecks, deck => deck.id.uuid)));
  const close = useCallback(() => {
    Navigation.dismissModal(componentId);
  }, [componentId]);
  useNavigationButtonPressed(({ buttonId }) => {
    if (buttonId === 'close') {
      close();
    }
  }, componentId, [close]);

  const updateInvestigatorXp = useCallback((investigator: CampaignInvestigator, xp: number) => {
    if (campaign) {
      const investigatorData = campaign.getInvestigatorData(investigator.code);
      const oldXp = investigatorData.availableXp || 0;
      dispatch(updateCampaignXp(
        updateCampaignActions,
        id,
        investigator.code,
        oldXp + xp,
        'availableXp'
      ));
    }
  }, [campaign, id, updateCampaignActions, dispatch]);

  const showDeckUpgradeDialog = useCallback((deck: Deck, investigator?: CampaignInvestigator) => {
    const backgroundColor = colors.faction[investigator ? investigator?.card.factionCode() : 'neutral'].background;
    Navigation.push<UpgradeDeckProps>(componentId, {
      component: {
        name: 'Deck.Upgrade',
        passProps: {
          id: getDeckId(deck),
          campaignId: id,
          showNewDeck: false,
        },
        options: {
          statusBar: Platform.select({
            android: { style: 'dark' },
            ios: {
              style: 'light',
              backgroundColor,
            },
          }),
          topBar: {
            title: {
              text: t`Upgrade`,
              color: 'white',
            },
            subtitle: {
              text: investigator ? investigator.card.name : '',
              color: 'white',
            },
            background: {
              color: backgroundColor,
            },
          },
        },
      },
    });
  }, [componentId, id, colors]);
  if (!campaign) {
    return null;
  }
  return (
    <ScrollView contentContainerStyle={[styles.container, backgroundStyle]}>
      <View style={space.marginS}>
        <Text style={typography.small}>
          { t`By upgrading a deck, you can track XP and story card upgrades as your campaign develops.\n\nPrevious versions of your deck will still be accessible.` }
        </Text>
      </View>
      <UpgradeDecksList
        lang={lang}
        campaign={campaign}
        allInvestigators={allInvestigators}
        decks={latestDecks}
        originalDeckUuids={originalDeckUuids.current}
        showDeckUpgradeDialog={showDeckUpgradeDialog}
        updateInvestigatorXp={updateInvestigatorXp}
      />
      <BasicButton title={t`Done`} onPress={close} />
      <View style={styles.footer} />
    </ScrollView>
  );
}

UpgradeDecksView.options = (passProps: UpgradeDecksProps) => {
  return {
    topBar: {
      title: {
        text: passProps.scenarioResult.scenario,
      },
      subtitle: {
        text: t`Update investigator decks`,
      },
      leftButtons: [{
        icon: iconsMap.dismiss,
        id: 'close',
        color: COLORS.M,
        accessibilityLabel: t`Cancel`,
      }],
    },
  };
};
export default UpgradeDecksView;

const styles = StyleSheet.create({
  container: {
    paddingTop: s,
    paddingBottom: s,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  footer: {
    height: 100,
  },
});
