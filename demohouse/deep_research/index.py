# Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
# Licensed under the 【火山方舟】原型应用软件自用许可协议
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     https://www.volcengine.com/docs/82379/1433703
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
import os
from typing import AsyncIterable, Union

from arkitect.core.component.llm.model import (
    ArkChatCompletionChunk,
    ArkChatRequest,
    ArkChatResponse,
)
from arkitect.launcher.local.serve import launch_serve
from arkitect.launcher.vefaas import bot_wrapper
from arkitect.telemetry.trace import task
from search_engine.tavily import TavilySearchEngine
from search_engine.volc_bot import VolcBotSearchEngine
from deep_research import DeepResearch

from utils import get_last_message

logging.basicConfig(
    level=logging.INFO, format="[%(asctime)s][%(levelname)s] %(message)s"
)
LOGGER = logging.getLogger(__name__)

ARK_API_KEY = "{YOUR_ARK_API_KEY}"
REASONING_EP_ID = "{YOUR_ENDPOINT_ID}"
TAVILY_API_KEY = "{YOUR_TAVILY_API_KEY}"
SEARCH_BOT_ID = "{YOUR_BOT_ID}"


@task()
async def main(
        request: ArkChatRequest,
) -> AsyncIterable[Union[ArkChatCompletionChunk, ArkChatResponse]]:
    # using last_user_message as query
    last_user_message = get_last_message(request.messages, "user")
    deep_research = DeepResearch(
        search_engine=VolcBotSearchEngine(bot_id=SEARCH_BOT_ID, api_key=ARK_API_KEY), # using volc bot as search engine
        # search_engine=TavilySearchEngine(api_key=TAVILY_API_KEY), # using tavily as search engine
        endpoint_id=REASONING_EP_ID,
    )

    if request.stream:
        async for c in deep_research.astream_deep_research(request=request, question=last_user_message.content):
            yield c
    else:
        rsp = await deep_research.arun_deep_research(request=request, question=last_user_message.content)
        yield rsp


@bot_wrapper()
@task(custom_attributes={"input": None, "output": None})
async def handler(
        request: ArkChatRequest,
) -> AsyncIterable[Union[ArkChatCompletionChunk, ArkChatResponse]]:
    async for resp in main(request):
        yield resp


if __name__ == "__main__":
    port = os.getenv("_FAAS_RUNTIME_PORT")
    launch_serve(
        package_path="index",
        port=int(port) if port else 8888,
        health_check_path="/v1/ping",
        endpoint_path="/api/v3/chat/completions",
        trace_on=False,
        clients={},
    )
