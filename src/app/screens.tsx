import React from 'react';
import { Navigation } from 'react-native-navigation';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import MythosButton from '@components/cardlist/CardSearchComponent/MythosButton';
import TuneButton from '@components/cardlist/CardSearchComponent/TuneButton';
import MyCampaignsView from '@components/campaign/MyCampaignsView';
import MyDecksView from '@components/decklist/MyDecksView';
import BrowseCardsView from '@components/cardlist/BrowseCardsView';
import SettingsView from '@components/settings/SettingsView';
import RuleTitleComponent from '@components/settings/RuleTitleComponent';
import ListToggleButton from '@components/deck/ListToggleButton';
import MapToggleButton from '@components/campaignguide/MapToggleButton';
import Toast from '@components/Toast';
import TarotOverlay from '@components/core/TarotOverlay';

interface ProviderProps<S> {
  store: S;
  children: React.ReactNode;
}

function getStandardComponent(componentName: string | number) {
  switch (componentName) {
    case 'About': return require('@components/settings/AboutView').default;
    case 'Browse.InvestigatorCards': return require('@components/cardlist/InvestigatorCardsView').default;
    case 'Deck.Charts': return require('@components/deck/DeckChartsView').default;
    case 'Deck.History': return require('@components/deck/DeckHistoryView').default;
    case 'Deck.Checklist': return require('@components/deck/DeckChecklistView').default;
    case 'Deck.DrawSimulator': return require('@components/deck/DrawSimulatorView').default;
    case 'Deck.Description': return require('@components/deck/DeckDescriptionView').default;
    case 'Deck.DraftCards': return require('@components/deck/DeckDraftView').default;
    case 'Deck.EditSpecial': return require('@components/deck/EditSpecialDeckCardsView').default;
    case 'Deck.NewOptions': return require('@components/deck/NewDeckOptionsDialog').default;
    case 'Card': return require('@components/card/CardDetailView').default;
    case 'Card.Swipe': return require('@components/card/DbCardDetailSwipeView').default;
    case 'Card.Faq': return require('@components/card/CardFaqView').default;
    case 'Card.Taboo': return require('@components/card/CardTabooView').default;
    case 'Card.Image': return require('@components/card/CardImageView').default;
    case 'Card.Investigators': return require('@components/card/CardInvestigatorsView').default;
    case 'Campaign.Access': return require('@components/campaign/CampaignAccessView').default;
    case 'Campaign.Log': return require('@components/campaign/CampaignLogView').default;
    case 'Campaign.Map': return require('@components/campaignguide/CampaignMapView').default;
    case 'Campaign.Scenarios': return require('@components/campaign/CampaignScenariosView').default;
    case 'Campaign.AddResult': return require('@components/campaign/AddScenarioResultView').default;
    case 'Guide.SideScenario': return require('@components/campaignguide/AddSideScenarioView').default;
    case 'Guide.ExileSelector': return require('@components/campaignguide/SelectExileCardsView').default;
    case 'Guide.CardErrata': return require('@components/campaignguide/EncounterCardErrataView').default;
    case 'Guide.ScenarioFaq': return require('@components/campaignguide/ScenarioFaqView').default;
    case 'Guide.ChallengeScenario': return require('@components/campaignguide/ChallengeScenarioView').default;
    case 'Guide.DrawChaosBag': return require('@components/chaos/GuideDrawChaosBagView').default;
    case 'Guide.OddsCalculator': return require('@components/chaos/GuideOddsCalculatorView').default;
    case 'Guide.Achievements': return require('@components/campaignguide/CampaignAchievementsView').default;
    case 'Guide.Rules': return require('@components/campaignguide/CampaignRulesView').default;
    case 'Guide.Log': return require('@components/campaignguide/CampaignLogView').default;
    case 'Guide.LocationSetup': return require('@components/campaignguide/LocationSetupView').default;
    case 'Guide.WeaknessSet': return require('@components/campaignguide/WeaknessSetView').default;
    case 'Guide.CardSelector': return require('@components/campaignguide/CardSelectorView').default;
    case 'Friends': return require('@components/social/FriendsView').default;
    case 'Campaign.Tarot': return require('@components/campaign/TarotCardReadingView').default;
    case 'Campaign.UpgradeDecks': return require('@components/campaign/UpgradeDecksView').default;
    case 'Campaign.EditResult': return require('@components/campaign/EditScenarioResultView').default;
    case 'Campaign.DrawChaosBag': return require('@components/chaos/CampaignDrawChaosBagView').default;
    case 'OddsCalculator': return require('@components/chaos/OddsCalculatorView').default;
    case 'Settings.Diagnostics': return require('@components/settings/DiagnosticsView').default;
    case 'Settings.ReleaseNotes': return require('@components/settings/ReleaseNotesView').default;
    case 'Settings.Backup': return require('@components/settings/BackupView').default;
    case 'Settings.MergeBackup': return require('@components/settings/MergeBackupView').default;
    case 'Settings.SafeMode': return require('@components/settings/SafeModeView').default;
    case 'SearchFilters': return require('@components/filter/CardFilterView').default;
    case 'SearchFilters.Asset': return require('@components/filter/CardAssetFilterView').default;
    case 'SearchFilters.Enemy': return require('@components/filter/CardEnemyFilterView').default;
    case 'SearchFilters.Location': return require('@components/filter/CardLocationFilterView').default;
    case 'SearchFilters.Packs': return require('@components/filter/PackFilterView').default;
    case 'SearchFilters.Chooser': return require('@components/cardlist/SearchMultiSelectView').default;
    case 'My.Collection': return require('@components/settings/CollectionEditView').default;
    case 'Pack': return require('@components/settings/PackCardsView').default;
    case 'My.Spoilers': return require('@components/settings/SpoilersView').default;
    case 'Dialog.CardUpgrade': return require('@components/deck/CardUpgradeDialog').default;
    case 'Dialog.EditChaosBag': return require('@components/chaos/EditChaosBagDialog').default;
    case 'Dialog.CampaignDrawWeakness': return require('@components/campaign/CampaignDrawWeaknessDialog').default;
    case 'Dialog.CampaignEditWeakness': return require('@components/campaign/CampaignEditWeaknessDialog').default;
    case 'Weakness.Draw': return require('@components/weakness/WeaknessDrawDialog').default;
    case 'Rules': return require('@components/settings/RulesView').default;
    case 'Rule': return require('@components/settings/RuleView').default;
    case 'SimpleChaosBag': return require('@components/chaos/SimpleChaosBagScreen').default;

    default: return undefined;
  }
}

function getRootComponent(name: string | number): any {
  switch (name) {
    case 'Deck': return require('@components/deck/DeckDetailView').default;
    case 'Deck.Upgrade': return require('@components/deck/DeckUpgradeDialog').default;
    case 'Deck.New': return require('@components/deck/NewDeckView').default;
    case 'Campaign': return require('@components/campaign/CampaignDetailView').default;
    case 'Campaign.New': return require('@components/campaign/NewCampaignView').default;
    case 'Guide.Campaign': return require('@components/campaignguide/CampaignGuideView').default;
    case 'Guide.Scenario': return require('@components/campaignguide/ScenarioView').default;
    case 'Guide.LinkedCampaign': return require('@components/campaignguide/LinkedCampaignGuideView').default;
    case 'Guide.Standalone': return require('@components/campaignguide/StandaloneGuideView').default;
    case 'Dialog.Campaign': return require('@components/campaign/SelectCampaignDialog').default;
    case 'Dialog.DeckSelector': return require('@components/campaign/MyDecksSelectorDialog').default;
    case 'Deck.EditAddCards': return require('@components/deck/DeckEditView').default;
    default: return undefined;
  }
}

// register all screens of the app (including internal ones)
export function registerScreens<S>(Provider: React.ComponentType<ProviderProps<S>>, store: S) {
  function providerWrapper<Props extends Record<string, unknown>>(
    ScreenComponenet: React.ComponentType<Props>,
  ) {
    return () => gestureHandlerRootHOC((props: Props) => (
      <Provider store={store}>
        <ScreenComponenet {...props} />
      </Provider>
    ));
  }

  function providerNoGestureHandler<Props extends Record<string, unknown>>(
    ScreenComponenet: React.ComponentType<Props>,
  ) {
    return () => (props: Props) => (
      <Provider store={store}>
        <ScreenComponenet {...props} />
      </Provider>
    );
  }

  Navigation.registerComponent('Browse.Cards', providerWrapper(BrowseCardsView), () => BrowseCardsView);
  Navigation.registerComponent('My.Campaigns', providerWrapper(MyCampaignsView), () => MyCampaignsView);
  Navigation.registerComponent('My.Decks', providerWrapper(MyDecksView), () => MyDecksView);
  Navigation.registerComponent('Settings', providerWrapper(SettingsView), () => SettingsView);
  Navigation.registerComponent('TuneButton', providerWrapper(TuneButton), () => TuneButton);
  Navigation.registerComponent('Toast', providerNoGestureHandler(Toast), () => Toast);
  Navigation.registerComponent('Tarot', providerNoGestureHandler(TarotOverlay), () => TarotOverlay);
  Navigation.registerComponent('ListToggleButton', providerWrapper(ListToggleButton), () => ListToggleButton);
  Navigation.registerComponent('MapToggleButton', providerWrapper(MapToggleButton), () => MapToggleButton);
  Navigation.registerComponent('MythosButton', providerWrapper(MythosButton), () => MythosButton);
  // @ts-ignore
  Navigation.registerComponent('RulesTitle', providerWrapper(RuleTitleComponent), () => MythosButton);

  Navigation.setLazyComponentRegistrator((componentName: string | number) => {
    const RootComponent = getRootComponent(componentName);
    if (RootComponent) {
      Navigation.registerComponent(componentName, providerWrapper(RootComponent), () => RootComponent);
      return;
    }
    const StandardComponent = getStandardComponent(componentName);
    if (StandardComponent) {
      Navigation.registerComponent(componentName, providerWrapper(StandardComponent), () => StandardComponent);
      return;
    }
  });
}
