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

import { create } from 'zustand';

import { Event, EventType } from '../../types/event';
import { Message } from '../../types/message';

export interface CanvasStore {
  currentType: string;
  setCurrentType: (type: string) => void;
  data: Record<string, Event[]>;
  currentSessionId: string;
  currentIndex: number;
  showCanvas: boolean;
  setShowCanvas: (show: boolean) => void;
  setData: (sessionId: string, newData: Event) => void;
  setCurrentIndex: (index: number) => void;
  jumpIndexById: (sessionId: string, id: string) => void;
  resetData: () => void;
  updateDataFromMessage: (message: Message) => void;
  setCurrentSessionId: (sessionId: string) => void;
}

const initialState = {
  currentType: 'follow',
  data: {},
  currentSessionId: '',
  currentIndex: 0,
  showCanvas: false,
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  ...initialState,
  setCurrentType: type => set({ currentType: type }),
  setData: (sessionId, newData) =>
    set(state => {
      let events: Event[] = [];
      if (!state.data[sessionId] || state.data[sessionId].length === 0) {
        events = [newData];
      } else {
        const latestEvent = state.data[sessionId][state.data[sessionId].length - 1];
        // 若历史 id 为空，说明是 pending 事件，与后面同类型事件合并
        if (
          latestEvent.type === newData.type &&
          (!latestEvent.id || latestEvent.id === newData.id) &&
          latestEvent.history
        ) {
          // 拼接上一份 history
          const history = [...latestEvent.history, ...(newData?.history || [])];
          events = [...state.data[sessionId].slice(0, -1), { ...latestEvent, ...newData, history }];
        } else {
          events = [...state.data[sessionId], newData];
        }
      }

      return {
        data: { ...state.data, [sessionId]: events },
        currentIndex: events.length - 1,
        currentSessionId: sessionId,
        showCanvas: true,
      };
    }),
  setShowCanvas: show => set({ showCanvas: show }),
  setCurrentIndex: index => set({ currentIndex: index }),
  jumpIndexById: (sessionId, id) => {
    const { data } = get();
    if (!data[sessionId]) {
      return;
    }
    const index = data[sessionId].findIndex(e => e.id === id);
    if (index !== -1) {
      set({ currentSessionId: sessionId, currentIndex: index, showCanvas: true });
      // 切换到 follow 模式
      set({ currentType: 'follow' });
    }
  },
  resetData: () => set(initialState),
  updateDataFromMessage: (message: Message) => {
    const events: Event[] = [];
    const { sessionId = '' } = message;

    message.events?.forEach(event => {
      const { type, result } = event;
      if (
        type !== EventType.ReasoningText &&
        type !== EventType.OutputText &&
        type !== EventType.Planning &&
        type !== EventType.AssignTodo &&
        result?.status === 'completed'
      ) {
        events.push(event);
      }
      if (type === EventType.BrowserUse || type === EventType.ChatPPT) {
        events.push(event);
      }
    });
    // 将相同的 id 聚合
    const map = new Map<string, Event>();
    events.forEach(event => {
      if (event.id) {
        if (map.has(event.id)) {
          const oldEvent = map.get(event.id);
          if (oldEvent) {
            map.set(event.id, {
              ...oldEvent,
              ...event,
              history: [...(oldEvent.history || []), ...(event.history || [])],
            });
          }
        } else {
          map.set(event.id, event);
        }
      }
    });
    const newEvents = Array.from(map.values());

    return set(state => ({
      data: { ...state.data, [sessionId]: newEvents },
      currentSessionId: sessionId,
      currentIndex: newEvents.length - 1,
      showCanvas: newEvents.length > 0,
    }));
  },
  setCurrentSessionId: (sessionId: string) => set({ currentSessionId: sessionId }),
}));
