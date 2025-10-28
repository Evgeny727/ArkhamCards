import React, { useCallback, useContext, useMemo, useLayoutEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@navigation/types';
import { t } from 'ttag';

import PackListComponent from '@components/core/PackListComponent';
import { setInCollection, setCycleInCollection, setPackDraft } from '@actions';
import { getAllRealPacks, getDraftPacks, getPacksInCollection } from '@reducers';
import StyleContext from '@styles/StyleContext';
import DeckCheckboxButton from '@components/deck/controls/DeckCheckboxButton';
import space from '@styles/space';
import { useRemoteSettingFlag, useSettingFlag } from '@components/core/hooks';
import LoadingSpinner from '@components/core/LoadingSpinner';

import DeckButton from '@components/deck/controls/DeckButton';
import { useAppDispatch } from '@app/store';
import { useUpdateRemotePack, useUpdateRemoteSetting } from '@data/remote/settings';

export interface CollectionEditProps {
  draftMode?: boolean;
}

export default function CollectionEditView() {
  const route = useRoute<RouteProp<RootStackParamList, 'My.Collection'>>();
  const navigation = useNavigation();
  const { draftMode } = route.params;

  // Set screen title based on mode
  useLayoutEffect(() => {
    navigation.setOptions({
      title: draftMode ? t`Choose Packs` : t`Edit Collection`,
    });
  }, [navigation, draftMode]);

  const dispatch = useAppDispatch();
  const [draft] = useSelector(getDraftPacks);
  const [draftFromCollection, toggleDraftFromCollection] = useSettingFlag('draft_from_collection');
  const packs = useSelector(getAllRealPacks);
  const in_collection = useSelector(getPacksInCollection);
  const updateRemoteSetting = useUpdateRemoteSetting();
  const updateRemotePack = useUpdateRemotePack();
  const [ignoreCollection, toggleIgnoreCollection] = useRemoteSettingFlag('ignore_collection', updateRemoteSetting);
  const setChecked = useCallback((code: string, value: boolean) => {
    if (draftMode) {
      dispatch(setPackDraft(code, value));
    } else {
      dispatch(setInCollection(code, value, updateRemotePack));
    }
  }, [dispatch, draftMode, updateRemotePack]);

  const setCycleChecked = useCallback((cycle_code: string, value: boolean) => {
    if (draftMode) {
      dispatch(setPackDraft(cycle_code, value));
    } else {
      dispatch(setCycleInCollection(cycle_code, value, updateRemotePack));
    }
  }, [dispatch, draftMode, updateRemotePack]);

  const { backgroundStyle, typography } = useContext(StyleContext);
  const onEditCollection = useCallback(() => {
    navigation.navigate('My.Collection', { draftMode: false });
  }, [navigation]);
  const header = useMemo(() => {
    if (draftMode) {
      return (
        <>
          <View style={space.paddingSideS}>
            <DeckCheckboxButton
              icon="draft"
              title={t`Draft from card collection`}
              description={draftFromCollection ? t`Disable to choose which packs to draft from` : t`Draft using your card collection`}
              value={draftFromCollection}
              onValueChange={toggleDraftFromCollection}
            />
          </View>
          { draftFromCollection && (
            <View style={space.paddingS}>
              <DeckButton icon="card-outline" onPress={onEditCollection} title={t`Edit Collection`} shrink />
            </View>
          ) }
        </>
      );
    }
    return (
      <>
        <Text style={[typography.small, space.paddingS]}>
          { t`Use these controls to limit which cards are visible while searching, building decks, or upgrading cards to those in your own collection.` }
        </Text>
        <View style={space.paddingSideS}>
          <DeckCheckboxButton
            icon="show"
            title={t`Show all cards`}
            description={ignoreCollection ? t`Disable to choose individual packs to show` : t`All cards are shown throughout the app`}
            value={ignoreCollection}
            onValueChange={toggleIgnoreCollection}
          />
        </View>
      </>
    );
  }, [ignoreCollection, typography, draftMode, draftFromCollection, onEditCollection, toggleIgnoreCollection, toggleDraftFromCollection]);
  if (!packs.length) {
    return (
      <LoadingSpinner large />
    );
  }
  return (
    <View style={[styles.container, backgroundStyle]}>
      { !draftMode && ignoreCollection ? header : (
        <PackListComponent
          alwaysShowCoreSet={draftMode}
          coreSetName={t`Second Core Set`}
          packs={packs}
          header={header}
          cyclesOnly={draftMode}
          includeNoCore
          checkState={draftMode ? draft : in_collection}
          setChecked={draftMode && draftFromCollection ? undefined : setChecked}
          setCycleChecked={draftMode && draftFromCollection ? undefined : setCycleChecked}
        />
      ) }
    </View>
  );
}

CollectionEditView.options = (passProps: CollectionEditProps) => {
  return {
    topBar: {
      title: {
        text: passProps.draftMode ? t`Draft Pool` : t`Edit Collection`,
      },
    },
  };
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
