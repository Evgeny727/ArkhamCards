import React, { useCallback, useContext, useMemo, useState } from 'react';
import { find, map } from 'lodash';
import { TabView, SceneRendererProps, NavigationState, TabBar, Route } from 'react-native-tab-view';

import StyleContext from '@styles/StyleContext';
import { isTablet } from '@styles/space';

interface Props {
  tabs: {
    key: string;
    title: string;
    node: React.ReactNode;
  }[];
  onTabChange?: (key: string) => void;
  scrollEnabled?: boolean;
}

interface TabRoute extends Route {
  key: string;
  title: string;
}

export default function useTabView({ tabs, onTabChange, scrollEnabled }: Props): [React.ReactNode, (index: number) => void] {
  const { fontScale, colors, width } = useContext(StyleContext);
  const [index, setIndex] = useState(0);

  const onIndexChange = useCallback((index: number) => {
    setIndex(index);
    onTabChange && onTabChange(tabs[index].key);
  }, [onTabChange, setIndex, tabs]);

  const renderTabBar = useCallback((props: SceneRendererProps & {
    navigationState: NavigationState<TabRoute>;
  }) => {
    return (
      <TabBar
        // {...props}
        layout={props.layout}
        position={props.position}
        jumpTo={props.jumpTo}
        navigationState={props.navigationState}
        scrollEnabled={scrollEnabled || (!isTablet && fontScale > 1)}
        activeColor={colors.D20}
        inactiveColor={colors.M}
        indicatorStyle={{ backgroundColor: colors.D20 }}
        style={{ backgroundColor: colors.L20 }}
        labelStyle={{
          fontFamily: 'Alegreya-Regular',
          fontSize: 14 * fontScale,
          lineHeight: 16 * fontScale,
        }}
      />
    );
  }, [fontScale, colors, scrollEnabled]);

  const renderTab = useCallback(({ route }: { route: { key: string } }) => {
    const tab = find(tabs, t => t.key === route.key);
    return tab?.node;
  }, [tabs]);

  const routes: TabRoute[] = useMemo(() => map(tabs, tab => {
    return {
      key: tab.key,
      title: tab.title,
    };
  }), [tabs]);
  const tabView = useMemo(() => {
    if (!width) {
      return null;
    }
    return (
      <TabView
        key="tab"
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderTab}
        onIndexChange={onIndexChange}
        initialLayout={{ width }}
      />
    );
  }, [width, renderTabBar, index, routes, renderTab, onIndexChange]);

  return [tabView, setIndex];
}
