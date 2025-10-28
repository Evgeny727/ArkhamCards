import React, { ForwardedRef, forwardRef, useCallback, useContext, useImperativeHandle } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { t } from 'ttag';

import { Slots } from '@actions/types';
import BasicListRow from '@components/core/BasicListRow';
import CardSectionHeader from '@components/core/CardSectionHeader';
import ExileCardSelectorComponent from '@components/campaign/ExileCardSelectorComponent';
import Card from '@data/types/Card';
import PlusMinusButtons from '@components/core/PlusMinusButtons';
import space, { m } from '@styles/space';
import StyleContext from '@styles/StyleContext';
import { useCounter, useSlots } from '@components/core/hooks';
import DeckButton from './controls/DeckButton';
import { SaveDeckUpgrade } from './useDeckUpgradeAction';
import LatestDeckT from '@data/interfaces/LatestDeckT';
import { CampaignInvestigator } from '@data/scenario/GuidedCampaignLog';

export interface DeckUpgradeComponentProps {
  investigator: CampaignInvestigator;
  deck: LatestDeckT;
  hideXp?: boolean;
  startingXp?: number;
  exileSection?: React.ReactNode;
  campaignSection?: React.ReactNode;
  storyCounts: Slots;
  ignoreStoryCounts: Slots;
  saveDeckUpgrade: SaveDeckUpgrade<undefined>;
  saving: boolean;
  error?: string | undefined;
  saveButtonText?: string;
}

export interface DeckUpgradeHandles {
  save: () => void;
}

function DeckUpgradeComponent(props: DeckUpgradeComponentProps, ref: ForwardedRef<DeckUpgradeHandles>) {
  const {
    investigator,
    deck,
    startingXp,
    campaignSection,
    exileSection,
    storyCounts,
    ignoreStoryCounts,
    saveDeckUpgrade,
    saveButtonText,
    saving,
    error,
    hideXp,
  } = props;
  const { backgroundStyle, colors, typography } = useContext(StyleContext);
  const [xp, incXp, decXp] = useCounter(startingXp ?? 0, { min: 0 });
  const [exileCounts, updateExileCounts] = useSlots({});

  const doSave = useCallback(() => {
    saveDeckUpgrade(deck, xp, storyCounts, ignoreStoryCounts, exileCounts, undefined);
  }, [saveDeckUpgrade, deck, xp, storyCounts, ignoreStoryCounts, exileCounts]);

  useImperativeHandle(ref, () => ({
    save: async() => {
      doSave();
    },
  }), [doSave]);
  const onExileCountChange = useCallback((card: Card, count: number) => {
    updateExileCounts({ type: 'set-slot', code: card.code, value: count });
  }, [updateExileCounts]);
  if (!deck) {
    return null;
  }
  if (saving) {
    return (
      <View style={[styles.container, styles.saving, backgroundStyle]}>
        <Text style={typography.text}>
          { t`Saving...` }
        </Text>
        <ActivityIndicator
          style={space.marginTopM}
          color={colors.lightText}
          size="large"
          animating
        />
      </View>
    );
  }
  const xpString = xp >= 0 ? `+${xp}` : `${xp}`;
  return (
    <View style={styles.container}>
      { !!error && <Text style={[typography.text, typography.error]}>{ error }</Text> }
      { !hideXp && (
        <View style={styles.xpBlock}>
          <CardSectionHeader
            investigator={investigator.card}
            section={{ superTitle: t`Experience points` }}
          />
          <BasicListRow>
            <Text style={typography.text}>
              { xpString }
            </Text>
            <PlusMinusButtons
              count={xp}
              dialogStyle
              onIncrement={incXp}
              onDecrement={decXp}
            />
          </BasicListRow>
        </View>
      ) }
      <ExileCardSelectorComponent
        deck={deck}
        label={(
          <CardSectionHeader
            section={{ superTitle: t`Exiled cards` }}
            investigator={investigator.card}
          />
        )}
        exileCounts={exileCounts}
        updateExileCount={onExileCountChange}
      >
        { exileSection }
      </ExileCardSelectorComponent>
      { !!campaignSection && campaignSection }
      { !!saveButtonText && (
        <View style={space.paddingM}>
          <DeckButton icon="upgrade" color="gold" onPress={doSave} title={saveButtonText} />
        </View>
      ) }
    </View>
  );
}

// @ts-ignore
export default forwardRef<DeckUpgradeHandles, DeckUpgradeComponentProps>(DeckUpgradeComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  saving: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: m,
    paddingBottom: m,
  },
  xpBlock: {
    borderRadius: 4,
  },
});
