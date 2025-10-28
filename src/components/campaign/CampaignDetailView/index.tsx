import React, { useCallback, useContext, useLayoutEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { map } from 'lodash';
import { useDispatch } from 'react-redux';

import { t } from 'ttag';
import { Action } from 'redux';

import BasicButton from '@components/core/BasicButton';
import { CampaignId, CUSTOM, Deck, DeckId, getDeckId, OZ, Slots, Trauma, WeaknessSet } from '@actions/types';
import DecksSection from './DecksSection';
import { updateCampaignXp, cleanBrokenCampaigns, addInvestigator, removeInvestigator, updateCampaignInvestigatorTrauma, updateCampaignWeaknessSet, updateCampaignName } from '../actions';
import COLORS from '@styles/colors';
import StyleContext from '@styles/StyleContext';
import { useLatestDecksCards, useWeaknessCards } from '@components/core/hooks';
import { useCampaign, useCampaignInvestigators } from '@data/hooks';
import useTraumaDialog from '../useTraumaDialog';
import { showAddScenarioResult, showDrawWeakness } from '@components/campaign/nav';
import { campaignNames } from '../constants';
import space, { s } from '@styles/space';
import CampaignSummaryHeader from '../CampaignSummaryHeader';
import { useAlertDialog, useCountDialog, useSimpleTextDialog } from '@components/deck/dialogs';
import { maybeShowWeaknessPrompt, useMaybeShowWeaknessPrompt } from '../campaignHelper';
import Card from '@data/types/Card';
import { MyDecksSelectorProps } from '../MyDecksSelectorDialog';
import ArkhamCardsAuthContext from '@lib/ArkhamCardsAuthContext';
import { useCampaignId, useXpDialog } from '../hooks';
import DeckButton from '@components/deck/controls/DeckButton';
import DeleteCampaignButton from '../DeleteCampaignButton';
import UploadCampaignButton from '../UploadCampaignButton';
import useChaosBagDialog from './useChaosBagDialog';
import useTextEditDialog from '@components/core/useTextEditDialog';
import { useDeckActions } from '@data/remote/decks';
import { useCampaignDeleted, useDismissOnCampaignDeleted, useUpdateCampaignActions } from '@data/remote/campaigns';
import LoadingSpinner from '@components/core/LoadingSpinner';
import { ThunkDispatch } from 'redux-thunk';
import { AppState } from '@reducers';
import { useAppDispatch } from '@app/store';
import DeckOverlapComponent from '@components/deck/DeckDetailView/DeckOverlapComponent';
import CampaignHeader from '@components/campaignguide/CampaignHeader';
import { CampaignInvestigator } from '@data/scenario/GuidedCampaignLog';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@navigation/types';
import HeaderButton from '@components/core/HeaderButton';

export interface CampaignDetailProps {
  campaignId: CampaignId;
  upload?: boolean;
}

const EMPTY_CHAOS_BAG = {};
type AsyncDispatch = ThunkDispatch<AppState, unknown, Action>;

function CampaignDetailView() {
  const route = useRoute<RouteProp<RootStackParamList, 'Campaign'>>();
  const navigation = useNavigation();
  const { upload } = route.params;

  const [textEditDialog, showTextEditDialog] = useTextEditDialog();
  const [countDialog, showCountDialog] = useCountDialog();
  const [campaignId, setCampaignServerId, uploadingCampaign] = useCampaignId(route.params.campaignId);
  const { backgroundStyle } = useContext(StyleContext);
  const { userId } = useContext(ArkhamCardsAuthContext);
  const weaknessCards = useWeaknessCards();
  const campaign = useCampaign(campaignId, true);
  const [allInvestigators,, loadingInvestigators] = useCampaignInvestigators(campaign);

  const updateCampaignActions = useUpdateCampaignActions();
  const dispatch = useAppDispatch();
  const asyncDispatch: AsyncDispatch = useDispatch();

  const updateInvestigatorTrauma = useCallback((investigator: string, trauma: Trauma) => {
    dispatch(updateCampaignInvestigatorTrauma(updateCampaignActions, campaignId, investigator, trauma));
  }, [dispatch, updateCampaignActions, campaignId]);

  const {
    showTraumaDialog,
    traumaDialog,
  } = useTraumaDialog(updateInvestigatorTrauma);

  useCampaignDeleted(campaign);
  useDismissOnCampaignDeleted(navigation, campaign);

  const updateWeaknessSet = useCallback((weaknessSet: WeaknessSet) => {
    dispatch(updateCampaignWeaknessSet(updateCampaignActions.setWeaknessSet, campaignId, weaknessSet));
  }, [dispatch, updateCampaignActions, campaignId]);

  const updateSpentXp = useCallback((code: string, value: number) => {
    dispatch(updateCampaignXp(updateCampaignActions, campaignId, code, value, 'spentXp'));
  }, [dispatch, campaignId, updateCampaignActions]);
  const name = campaign?.name;

  const cleanBrokenCampaignsPressed = useCallback(() => {
    dispatch(cleanBrokenCampaigns());
    navigation.goBack();
  }, [navigation, dispatch]);


  const drawWeaknessPressed = useCallback(() => {
    showDrawWeakness(navigation, campaignId);
  }, [navigation, campaignId]);

  const setCampaignName = useCallback((name: string) => {
    dispatch(updateCampaignName(updateCampaignActions, campaignId, name));
    navigation.setOptions({ title: name });
  }, [campaignId, dispatch, updateCampaignActions, navigation]);
  const [dialog, showEditNameDialog] = useSimpleTextDialog({
    title: t`Name`,
    value: campaign?.name || '',
    onValueChange: setCampaignName,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerRight: () => (
        <HeaderButton
          iconName="edit"
          accessibilityLabel={t`Edit`}
          onPress={showEditNameDialog}
          color={COLORS.M}
        />
      ),
    })
  }, [name, navigation, showEditNameDialog]);

  const updateWeaknessAssignedCards = useCallback((weaknessCards: Slots) => {
    if (campaign) {
      updateWeaknessSet({
        packCodes: campaign.weaknessSet.packCodes || [],
        assignedCards: weaknessCards,
      });
    }
  }, [updateWeaknessSet, campaign]);
  const [alertDialog, showAlert] = useAlertDialog();

  const checkForWeaknessPrompt = useCallback((deck: Deck) => {
    if (weaknessCards && campaign) {
      maybeShowWeaknessPrompt(
        deck,
        weaknessCards,
        campaign.weaknessSet.assignedCards || {},
        updateWeaknessAssignedCards,
        showAlert
      );
    }
  }, [weaknessCards, campaign, updateWeaknessAssignedCards, showAlert]);
  const deckActions = useDeckActions();
  const checkNewDeckForWeakness = useMaybeShowWeaknessPrompt(checkForWeaknessPrompt);
  const onAddDeck = useCallback(async(deck: Deck, investigator_code?: string) => {
    await asyncDispatch(addInvestigator(userId, deckActions, updateCampaignActions, campaignId, investigator_code ?? deck.investigator_code, getDeckId(deck)));
    checkNewDeckForWeakness(deck);
  }, [userId, campaignId, deckActions, updateCampaignActions, checkNewDeckForWeakness, asyncDispatch]);

  const onAddInvestigator = useCallback((card: CampaignInvestigator) => {
    dispatch(addInvestigator(userId, deckActions, updateCampaignActions, campaignId, card.code));
  }, [userId, campaignId, deckActions, updateCampaignActions, dispatch]);

  const onRemoveInvestigator = useCallback((investigator: CampaignInvestigator, removedDeckId?: DeckId) => {
    dispatch(removeInvestigator(userId, updateCampaignActions, campaignId, investigator.code, removedDeckId));
  }, [userId, updateCampaignActions, campaignId, dispatch]);

  const showChooseDeck = useCallback((
    singleInvestigator?: CampaignInvestigator,
  ) => {
    if (!campaign) {
      return;
    }
    const includeParallel = campaign.cycleCode === OZ;
    const passProps: MyDecksSelectorProps = singleInvestigator ? {
      campaignId: campaign.id,
      singleInvestigator: singleInvestigator.card.alternate_of_code ?? singleInvestigator.card.code,
      onDeckSelect: (deck: Deck) => onAddDeck(deck, singleInvestigator.card.code ?? deck.investigator_code),
      includeParallel,
    } : {
      campaignId: campaign.id,
      selectedInvestigatorIds: map(
        allInvestigators,
        investigator => investigator.card.alternate_of_code ?? investigator.code
      ),
      onDeckSelect: onAddDeck,
      onInvestigatorSelect: (card: Card) => {
        onAddInvestigator({
          code: includeParallel ? card.code : card.alternate_of_code ?? card.code,
          card,
          alternate_code: card.alternate_of_code ? card.code : undefined,
        })
      },
      simpleOptions: true,
      includeParallel,
    };
    navigation.navigate('Dialog.DeckSelector', passProps);
  }, [campaign, allInvestigators, onAddDeck, onAddInvestigator, navigation]);

  const showAddInvestigator = useCallback(() => {
    showChooseDeck();
  }, [showChooseDeck]);
  const [xpDialog, actuallyShowXpDialog] = useXpDialog(updateSpentXp);
  const showXpDialog = useCallback((investigator: CampaignInvestigator) => {
    const data = campaign?.getInvestigatorData(investigator.code) || {};
    actuallyShowXpDialog(investigator, data?.spentXp || 0, data?.availableXp || 0);
  }, [actuallyShowXpDialog, campaign]);
  const showCampaignLog = useCallback(() => {
    navigation.navigate('Campaign.Log', { campaignId });
  }, [navigation, campaignId]);
  const showScenarios = useCallback(() => {
    navigation.navigate('Campaign.Scenarios', { campaignId });
  }, [navigation, campaignId]);
  const investigatorCount = allInvestigators ? allInvestigators.length : (campaign?.investigators.length || 0);

  const addScenarioResultPressed = useCallback(() => {
    showAddScenarioResult(navigation, campaignId);
  }, [campaignId, navigation]);
  const [chaosBagDialog, showChaosBag] = useChaosBagDialog({
    allInvestigators,
    campaignId,
    chaosBag: campaign?.chaosBag || EMPTY_CHAOS_BAG,
    setChaosBag: updateCampaignActions.setChaosBag,
    scenarioId: undefined,
    cycleCode: campaign?.cycleCode || 'custom',
    processedCampaign: undefined,
  });
  const latestDecks = useMemo(() => campaign?.latestDecks(), [campaign]);
  const [cards] = useLatestDecksCards(latestDecks, false, latestDecks?.length ? (latestDecks[0].deck.taboo_id || 0) : 0);

  if (!campaign) {
    if (campaignId.serverId) {
      return (
        <LoadingSpinner large message={uploadingCampaign ? t`Uploading campaign` : undefined} />
      );
    }
    return (
      <View>
        <BasicButton
          title={t`Clean up broken campaigns`}
          color={COLORS.red}
          onPress={cleanBrokenCampaignsPressed}
        />
      </View>
    );
  }
  return (
    <View style={[styles.flex, backgroundStyle]}>
      <View style={[styles.flex, backgroundStyle]}>
        <ScrollView contentContainerStyle={backgroundStyle}>
          <View style={space.paddingSideS}>
            <CampaignSummaryHeader
              name={campaign.cycleCode === CUSTOM ? campaign.name : campaignNames()[campaign.cycleCode]}
              cycle={campaign.cycleCode}
              difficulty={campaign.difficulty}
            />
            <DeckButton
              icon="log"
              title={t`Campaign Log`}
              detail={t`Review and add records`}
              color="light_gray"
              onPress={showCampaignLog}
              bottomMargin={s}
            />
            <DeckButton
              icon="chaos_bag"
              title={t`Chaos Bag`}
              detail={t`Review and draw tokens`}
              color="light_gray"
              onPress={showChaosBag}
              bottomMargin={s}
            />
            <DeckButton
              icon="book"
              title={t`Scenarios`}
              detail={t`Review scenario results`}
              color="light_gray"
              onPress={showScenarios}
              bottomMargin={s}
            />
            <DeckButton
              icon="finish"
              title={t`Add scenario result`}
              detail={t`Record completed scenario`}
              onPress={addScenarioResultPressed}
              color="dark_gray"
              bottomMargin={s}
            />
            <CampaignHeader style={space.paddingTopS} title={`${t`Investigators`} · ${investigatorCount}`} />
            <DecksSection
              showAlert={showAlert}
              showTextEditDialog={showTextEditDialog}
              showCountDialog={showCountDialog}
              campaign={campaign}
              campaignId={campaignId}
              latestDecks={campaign.latestDecks()}
              allInvestigators={allInvestigators}
              loading={loadingInvestigators}
              showTraumaDialog={showTraumaDialog}
              removeInvestigator={onRemoveInvestigator}
              showXpDialog={showXpDialog}
              showChooseDeck={showChooseDeck}
              setCampaignNotes={updateCampaignActions.setCampaignNotes}
            />
            <DeckButton
              color="light_gray"
              icon="plus-button"
              title={t`Add Investigator`}
              onPress={showAddInvestigator}
              bottomMargin={s}
            />
            <DeckButton
              icon="weakness"
              color="light_gray"
              title={t`Draw random basic weakness`}
              onPress={drawWeaknessPressed}
              bottomMargin={s}
            />
          </View>
          { !!cards && !!latestDecks && (
            <View style={[space.paddingSideS, space.paddingBottomS]}>
              <DeckOverlapComponent
                cards={cards}
                campaign={campaign}
                latestDecks={latestDecks}
                campaignInvestigators={allInvestigators}
              />
            </View>
          ) }
          <View style={space.paddingSideS}>
            <CampaignHeader style={space.paddingTopS} title={t`Settings`} />
            <UploadCampaignButton
              campaignId={campaignId}
              campaign={campaign}
              setCampaignServerId={setCampaignServerId}
              showAlert={showAlert}
              deckActions={deckActions}
              upload={upload}
            />
            <DeleteCampaignButton
              actions={updateCampaignActions}
              campaignId={campaignId}
              campaign={campaign}
              showAlert={showAlert}
            />
          </View>
        </ScrollView>
      </View>
      { alertDialog }
      { traumaDialog }
      { xpDialog }
      { dialog }
      { textEditDialog }
      { chaosBagDialog }
      { countDialog }
    </View>
  );
}

CampaignDetailView.options = () => {
  return {
    topBar: {
      title: {
        text: t`Campaign`,
      },
    },
  };
};
export default CampaignDetailView;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
