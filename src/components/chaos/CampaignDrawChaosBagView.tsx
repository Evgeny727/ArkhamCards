import React, { useCallback } from 'react';
import { Navigation, Options } from 'react-native-navigation';
import { t } from 'ttag';

import { useAppDispatch } from '@app/store';
import DrawChaosBagComponent from './DrawChaosBagComponent';
import { updateCampaignChaosBag } from '@components/campaign/actions';
import { NavigationProps } from '@components/nav/types';
import { ChaosBag } from '@app_constants';
import COLORS from '@styles/colors';
import { EditChaosBagProps } from './EditChaosBagDialog';
import { useNavigationButtonPressed } from '@components/core/hooks';
import { CampaignCycleCode, CampaignId } from '@actions/types';
import { showChaosBagOddsCalculator } from '../campaign/nav';
import { useSetCampaignChaosBag } from '@data/remote/campaigns';
import { useChaosBagResults, useNonGuideChaosBag } from '@data/hooks';
import { CampaignInvestigator } from '@data/scenario/GuidedCampaignLog';

export interface CampaignDrawChaosBagProps {
  campaignId: CampaignId;
  allInvestigators: CampaignInvestigator[];
  cycleCode: CampaignCycleCode,
}

type Props = NavigationProps & CampaignDrawChaosBagProps;

function CampaignDrawChaosBagView({ componentId, campaignId, allInvestigators, cycleCode }: Props) {
  const dispatch = useAppDispatch();
  const chaosBag = useNonGuideChaosBag(campaignId);
  const setCampaignChaosBag = useSetCampaignChaosBag();
  const updateChaosBag = useCallback((chaosBag: ChaosBag) => {
    dispatch(updateCampaignChaosBag(setCampaignChaosBag, campaignId, chaosBag));
  }, [dispatch, setCampaignChaosBag, campaignId]);

  const showEditChaosBagDialog = useCallback(() => {
    Navigation.push<EditChaosBagProps>(componentId, {
      component: {
        name: 'Dialog.EditChaosBag',
        passProps: {
          chaosBag,
          updateChaosBag: updateChaosBag,
          trackDeltas: true,
          cycleCode,
        },
        options: {
          topBar: {
            title: {
              text: t`Chaos Bag`,
            },
            backButton: {
              title: t`Cancel`,
            },
          },
        },
      },
    });
  }, [componentId, cycleCode, chaosBag, updateChaosBag]);


  const showChaosBagOdds = useCallback(() => {
    showChaosBagOddsCalculator(componentId, campaignId, allInvestigators);
  }, [componentId, campaignId, allInvestigators]);

  useNavigationButtonPressed(({ buttonId }) => {
    if (buttonId === 'back' || buttonId === 'androidBack') {
      Navigation.pop(componentId);
    } else if (buttonId === 'edit') {
      showEditChaosBagDialog();
    }
  }, componentId, [componentId, showEditChaosBagDialog]);
  const chaosBagResults = useChaosBagResults(campaignId);
  return (
    <DrawChaosBagComponent
      campaignId={campaignId}
      chaosBag={chaosBag}
      chaosBagResults={chaosBagResults}
      editViewPressed={showEditChaosBagDialog}
      viewChaosBagOdds={showChaosBagOdds}
      editable
    />
  );
}

CampaignDrawChaosBagView.options = (): Options => {
  return {
    topBar: {
      rightButtons: [{
        systemItem: 'save',
        text: t`Edit`,
        id: 'edit',
        color: COLORS.M,
        accessibilityLabel: t`Edit Chaos Bag`,
      }],
    },
  };
};

export default CampaignDrawChaosBagView;
