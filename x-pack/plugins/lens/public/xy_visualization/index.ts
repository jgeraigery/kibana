/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EUI_CHARTS_THEME_DARK, EUI_CHARTS_THEME_LIGHT } from '@elastic/eui/dist/eui_charts_theme';
import { CoreSetup, IUiSettingsClient } from 'kibana/public';
import moment from 'moment-timezone';
import { ExpressionsSetup } from '../../../../../src/plugins/expressions/public';
import { UI_SETTINGS } from '../../../../../src/plugins/data/public';
import { xyVisualization } from './xy_visualization';
import { xyChart, getXyChartRenderer } from './xy_expression';
import { legendConfig, layerConfig, yAxisConfig } from './types';
import { EditorFrameSetup, FormatFactory } from '../types';

export interface XyVisualizationPluginSetupPlugins {
  expressions: ExpressionsSetup;
  formatFactory: Promise<FormatFactory>;
  editorFrame: EditorFrameSetup;
}

function getTimeZone(uiSettings: IUiSettingsClient) {
  const configuredTimeZone = uiSettings.get('dateFormat:tz');
  if (configuredTimeZone === 'Browser') {
    return moment.tz.guess();
  }

  return configuredTimeZone;
}

export class XyVisualization {
  constructor() {}

  setup(
    core: CoreSetup,
    { expressions, formatFactory, editorFrame }: XyVisualizationPluginSetupPlugins
  ) {
    expressions.registerFunction(() => legendConfig);
    expressions.registerFunction(() => yAxisConfig);
    expressions.registerFunction(() => layerConfig);
    expressions.registerFunction(() => xyChart);

    expressions.registerRenderer(
      getXyChartRenderer({
        formatFactory,
        chartTheme: core.uiSettings.get<boolean>('theme:darkMode')
          ? EUI_CHARTS_THEME_DARK.theme
          : EUI_CHARTS_THEME_LIGHT.theme,
        timeZone: getTimeZone(core.uiSettings),
        histogramBarTarget: core.uiSettings.get<number>(UI_SETTINGS.HISTOGRAM_BAR_TARGET),
      })
    );

    editorFrame.registerVisualization(xyVisualization);
  }
}
