// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// Licensed under the 【火山方舟】原型应用软件自用许可协议
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
//     https://www.volcengine.com/docs/82379/1433703
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useInitConfig } from '@/demo/mcp/hooks/useInitConfig';
import { Host } from '@/demo/mcp/types';

import { Conversation } from './components/Conversation';
import { SideContent } from './components/SideContent';
import ChatStoreProvider from './store/ChatStore/provider';
import './style.css';
import styles from './index.module.less';
import { useConfigStore } from './store/ConfigStore/useConfigStore';
interface DeepResearchProps extends VmokBaseProps {
  botId?: string;
  // 可用的 mcp server list
  mcpServerList?: string[];
  host?: Host;
  debugEnabled?: boolean;
  mcpDebugHelper?: {
    iframeloading: boolean;
    currentDebugMessageId: string;
    tlsDebugPanelVisible: boolean;
    toggleDebugPanel: (botId?: string, logId?: string) => void;
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      // 默认不抛出错误，由业务方自己处理
      // throwOnError: true,
    },
  },
});

const MCP = (props: DeepResearchProps) => {
  const {
    botId = '',
    mcpServerList,
    url = '/BotMCPDeepResearch',
    urlPrefix,
    config,
    getHeader,
    auth,
    api,
    host = Host.AIBOTSQUARE,
    mcpDebugHelper,
    debugEnabled = false,
  } = props;
  const { accountId = '', userId = '0' } = auth || {};
  // 初始化配置
  useInitConfig({ apiPath: url, mcpServerList, mcpDebugHelper });
  const { setAccountId, setUserId, setBotId } = useConfigStore();

  useEffect(() => {
    if (api) {
      window.__DEMO_HOUSE_VAR = {
        api,
      };
    }
    setAccountId(accountId);
    setUserId(userId);
    setBotId(config?.id || botId);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ChatStoreProvider
        host={host}
        debugEnabled={debugEnabled}
        botId={config?.id || botId}
        url={url}
        urlPrefix={urlPrefix}
        config={config}
        accountId={accountId}
        userId={userId}
        getHeader={getHeader}
      >
        <div
          id="mcp-page-container"
          className={`${styles.deepResearchContainer}`}
        >
          <div className={styles.chatContent}>
            <Conversation />
          </div>
          <SideContent />
        </div>
      </ChatStoreProvider>
    </QueryClientProvider>
  );
};

export default MCP;
