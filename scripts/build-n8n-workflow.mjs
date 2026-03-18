import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(process.cwd(), "n8n", "cognitive-biases-atlas.workflow.json");

function node(id, name, type, position, parameters, extra = {}) {
  return {
    id,
    name,
    type,
    typeVersion: extra.typeVersion ?? 1,
    position,
    parameters,
    ...Object.fromEntries(Object.entries(extra).filter(([key]) => key !== "typeVersion"))
  };
}

const workflow = {
  name: "Cognitive Bias Atlas Bot",
  nodes: [
    node(
      "import-notes",
      "Import Notes",
      "n8n-nodes-base.stickyNote",
      [-3520, 928],
      {
        content:
          "После импорта:\n1. Назначь credentials на Telegram Trigger, Telegram, Postgres и Transcribe Voice.\n2. Открой node \"Attach Config (Telegram)\" и проверь URL сайта.\n3. В контейнер n8n должны быть переданы OPENROUTER_API_KEY, OPENROUTER_MODEL и N8N_WEBHOOK_SECRET.\n4. Для автозапуска курса после mini app регистрации нужен webhook path cb-miniapp-register.\n5. Контент в cb_lessons и cb_atlas_nodes уже должен быть загружен.",
        height: 360,
        width: 700,
        color: 6
      },
      { typeVersion: 1 }
    ),
    node(
      "telegram-trigger",
      "Telegram Trigger",
      "n8n-nodes-base.telegramTrigger",
      [-3280, 1328],
      {
        updates: ["message", "callback_query"],
        additionalFields: {}
      },
      { typeVersion: 1.2 }
    ),
    node(
      "registration-webhook",
      "Miniapp Registration Webhook",
      "n8n-nodes-base.webhook",
      [-3280, 1936],
      {
        httpMethod: "POST",
        path: "cb-miniapp-register",
        options: {}
      },
      { typeVersion: 2 }
    ),
    node(
      "attach-config-telegram",
      "Attach Config (Telegram)",
      "n8n-nodes-base.code",
      [-3056, 1328],
      {
        jsCode:
          "const siteUrl = 'https://cognitive-biaces.vercel.app';\nreturn [{\n  json: {\n    ...$json,\n    site_url: siteUrl,\n    miniapp_url: `${siteUrl}/miniapp/register`,\n    quiz_url: `${siteUrl}/quizzes/judgment-lab`,\n    openrouter_endpoint: 'https://openrouter.ai/api/v1/chat/completions',\n    openrouter_model: 'qwen/qwen3-coder:free',\n    openrouter_api_key: '',\n    webhook_secret: ''\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "attach-config-webhook",
      "Attach Config (Webhook)",
      "n8n-nodes-base.code",
      [-3056, 1936],
      {
        jsCode:
          "const siteUrl = 'https://cognitive-biaces.vercel.app';\nconst body = $json.body || {};\nconst expected = '';\nreturn [{\n  json: {\n    ...body,\n    secret_ok: !expected || body.secret === expected,\n    tg_id: String(body.tg_id || ''),\n    chat_id: String(body.tg_id || ''),\n    first_name: body.firstName || '',\n    last_name: body.lastName || '',\n    tg_username: body.tgUsername || '',\n    email: body.email || '',\n    site_url: siteUrl,\n    miniapp_url: `${siteUrl}/miniapp/register`,\n    quiz_url: `${siteUrl}/quizzes/judgment-lab`,\n    openrouter_endpoint: 'https://openrouter.ai/api/v1/chat/completions',\n    openrouter_model: 'qwen/qwen3-coder:free',\n    openrouter_api_key: '',\n    webhook_secret: expected\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "webhook-secret-valid",
      "Webhook Secret Valid?",
      "n8n-nodes-base.if",
      [-2832, 1936],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "webhook-secret-ok",
              leftValue: "={{ $json.secret_ok }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "webhook-invalid-noop",
      "Webhook Invalid",
      "n8n-nodes-base.noOp",
      [-2608, 2048],
      {},
      { typeVersion: 1 }
    ),
    node(
      "send-registration-complete",
      "Send Registration Complete",
      "n8n-nodes-base.telegram",
      [-2384, 1872],
      {
        chatId: "={{ $json.chat_id }}",
        text:
          "=✨ Регистрация завершена.\n\nТеперь курс, атлас и практика связаны с твоим Telegram. Ниже отправляю первый урок, с которого удобно начать.",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "prepare-course-entry-webhook",
      "Prepare Course Entry (Webhook)",
      "n8n-nodes-base.code",
      [-2384, 2000],
      {
        jsCode:
          "const source = $node['Attach Config (Webhook)']?.json || {};\nreturn [{\n  json: {\n    ...source,\n    course_entry_source: 'registration_webhook'\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "get-webhook-user",
      "Get Webhook User",
      "n8n-nodes-base.postgres",
      [-2160, 2000],
      {
        operation: "executeQuery",
        query:
          "select\n  u.*,\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ String($json.last_name || '').replace(/'/g, \"''\") }}'::text as last_name,\n  '{{ String($json.tg_username || '').replace(/'/g, \"''\") }}'::text as tg_username,\n  '{{ $json.email }}'::text as email,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.miniapp_url }}'::text as miniapp_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key\nfrom (select 1) seed\nleft join public.cb_users u on u.tg_id='{{ $json.tg_id }}'::text\nlimit 1;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "webhook-user-exists",
      "Webhook User Exists?",
      "n8n-nodes-base.if",
      [-1936, 2000],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "webhook-user-id-exists",
              leftValue: "={{ !!$json.id }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "create-webhook-user",
      "Create Webhook User",
      "n8n-nodes-base.postgres",
      [-1712, 2112],
      {
        operation: "executeQuery",
        query:
          "insert into public.cb_users (tg_id, tg_username, first_name, last_name, email, updated_at)\nvalues (\n  '{{ $json.tg_id }}'::text,\n  {{ $json.tg_username ? \"'\" + String($json.tg_username).replace(/'/g, \"''\") + \"'\" : 'null' }},\n  {{ $json.first_name ? \"'\" + String($json.first_name).replace(/'/g, \"''\") + \"'\" : 'null' }},\n  {{ $json.last_name ? \"'\" + String($json.last_name).replace(/'/g, \"''\") + \"'\" : 'null' }},\n  {{ $json.email ? \"'\" + String($json.email).replace(/'/g, \"''\") + \"'\" : 'null' }},\n  now()\n)\non conflict (tg_id) do update set\n  tg_username = excluded.tg_username,\n  first_name = coalesce(public.cb_users.first_name, excluded.first_name),\n  last_name = coalesce(public.cb_users.last_name, excluded.last_name),\n  email = coalesce(public.cb_users.email, excluded.email),\n  updated_at = now()\nreturning\n  tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.miniapp_url }}'::text as miniapp_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key;",
        options: {}
      },
      { typeVersion: 2.6 }
    ),
    node(
      "prepare-course-entry-webhook-user",
      "Prepare Course Entry (Webhook User)",
      "n8n-nodes-base.code",
      [-1488, 2000],
      {
        jsCode:
          "return [{\n  json: {\n    ...$json,\n    course_entry_source: 'registration_webhook'\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "is-callback",
      "Is Callback?",
      "n8n-nodes-base.if",
      [-2832, 1328],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "has-callback",
              leftValue: "={{ $json.callback_query.id }}",
              rightValue: "",
              operator: { type: "string", operation: "exists", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "prepare-callback-context",
      "Prepare Callback Context",
      "n8n-nodes-base.code",
      [-2608, 1216],
      {
        jsCode:
          "const cb = $json.callback_query || {};\nreturn [{\n  json: {\n    ...$json,\n    tg_id: String(cb.from?.id || ''),\n    chat_id: String(cb.from?.id || ''),\n    first_name: cb.from?.first_name || '',\n    message_id: String(cb.message?.message_id || ''),\n    current_message_text: cb.message?.text || cb.message?.caption || ' ',\n    callback_data: String(cb.data || '')\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "answer-callback",
      "Answer Callback",
      "n8n-nodes-base.telegram",
      [-2384, 1120],
      {
        resource: "callback",
        queryId: "={{ $json.callback_query.id }}",
        additionalFields: {}
      },
      { typeVersion: 1.2 }
    ),
    node(
      "get-callback-user",
      "Get Callback User",
      "n8n-nodes-base.postgres",
      [-2384, 1280],
      {
        operation: "executeQuery",
        query:
          "select\n  u.*,\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ String($json.message_id || '').replace(/'/g, \"''\") }}'::text as message_id,\n  '{{ String($json.current_message_text || '').replace(/'/g, \"''\") }}'::text as current_message_text,\n  '{{ String($json.callback_data || '').replace(/'/g, \"''\") }}'::text as callback_data,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.miniapp_url }}'::text as miniapp_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key\nfrom (select 1) seed\nleft join public.cb_users u on u.tg_id='{{ $json.tg_id }}'::text\nlimit 1;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "callback-registered",
      "Callback Registered?",
      "n8n-nodes-base.if",
      [-2160, 1280],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "callback-email-exists",
              leftValue: "={{ !!$json.email }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "send-registration-prompt",
      "Send Registration Prompt",
      "n8n-nodes-base.telegram",
      [-1936, 1408],
      {
        chatId: "={{ $json.chat_id }}",
        text:
          "=👋 {{ $json.first_name || 'Привет' }}! Чтобы продолжить курс, сначала заверши быструю регистрацию.\n\nНужен email, чтобы связать Telegram с сайтом, атласом и квизами в один маршрут.",
        replyMarkup: "inlineKeyboard",
        inlineKeyboard: {
          rows: [
            {
              row: {
                buttons: [
                  {
                    text: "Открыть регистрацию",
                    additionalFields: {
                      web_app: {
                        url: "={{ $json.miniapp_url }}"
                      }
                    }
                  }
                ]
              }
            }
          ]
        },
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "normalize-callback-route",
      "Normalize Callback Route",
      "n8n-nodes-base.code",
      [-1936, 1152],
      {
        jsCode:
          "const raw = String($json.callback_data || '').trim();\nconst out = {\n  ...$json,\n  route: 'unknown',\n  lesson_id: '',\n  question_text: ''\n};\nlet match;\nif ((match = raw.match(/^lesson:next:(.+)$/))) {\n  out.route = 'next';\n  out.lesson_id = match[1];\n} else if ((match = raw.match(/^lesson:save:(.+)$/))) {\n  out.route = 'save';\n  out.lesson_id = match[1];\n} else if ((match = raw.match(/^lesson:ai:(.+)$/))) {\n  out.route = 'ai_open';\n  out.lesson_id = match[1];\n} else if ((match = raw.match(/^ai:suggest:(.+):(life|spot|practice)$/))) {\n  out.route = 'ai_suggest';\n  out.lesson_id = match[1];\n  out.question_text = match[2] === 'life'\n    ? 'Как это искажение проявляется в обычной жизни?'\n    : match[2] === 'spot'\n      ? 'Как замечать это искажение у себя в моменте?'\n      : 'Что делать на практике, чтобы не попадать в эту ловушку?';\n}\nreturn [{ json: out }];"
      },
      { typeVersion: 2 }
    ),
    node(
      "callback-route",
      "Callback Route",
      "n8n-nodes-base.switch",
      [-1712, 1152],
      {
        rules: {
          values: [
            {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [
                  {
                    id: "callback-next",
                    leftValue: "={{ $json.route }}",
                    rightValue: "next",
                    operator: { type: "string", operation: "equals" }
                  }
                ],
                combinator: "and"
              },
              renameOutput: true,
              outputKey: "next"
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [
                  {
                    id: "callback-save",
                    leftValue: "={{ $json.route }}",
                    rightValue: "save",
                    operator: { type: "string", operation: "equals" }
                  }
                ],
                combinator: "and"
              },
              renameOutput: true,
              outputKey: "save"
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [
                  {
                    id: "callback-ai-open",
                    leftValue: "={{ $json.route }}",
                    rightValue: "ai_open",
                    operator: { type: "string", operation: "equals" }
                  }
                ],
                combinator: "and"
              },
              renameOutput: true,
              outputKey: "ai_open"
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [
                  {
                    id: "callback-ai-suggest",
                    leftValue: "={{ $json.route }}",
                    rightValue: "ai_suggest",
                    operator: { type: "string", operation: "equals" }
                  }
                ],
                combinator: "and"
              },
              renameOutput: true,
              outputKey: "ai_suggest"
            }
          ]
        },
        options: {}
      },
      { typeVersion: 3.2 }
    ),
    node(
      "freeze-lesson-card",
      "Freeze Lesson Card",
      "n8n-nodes-base.telegram",
      [-1488, 1024],
      {
        operation: "editMessageText",
        chatId: "={{ $json.chat_id }}",
        messageId: "={{ $json.message_id }}",
        text: "={{ $json.current_message_text || ' ' }}",
        additionalFields: {
          parse_mode: "HTML"
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "complete-lesson",
      "Complete Lesson",
      "n8n-nodes-base.postgres",
      [-1264, 1024],
      {
        operation: "executeQuery",
        query:
          "update public.cb_user_lessons\nset status = 'completed',\n    completed_at = now()\nwhere user_tg_id = '{{ $node[\"Normalize Callback Route\"].json.tg_id }}'\n  and lesson_id = '{{ $node[\"Normalize Callback Route\"].json.lesson_id }}';",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "prepare-course-entry-callback",
      "Prepare Course Entry (Callback)",
      "n8n-nodes-base.code",
      [-1040, 1024],
      {
        jsCode:
          "const source = $node['Normalize Callback Route']?.json || {};\nreturn [{\n  json: {\n    ...source,\n    course_entry_source: 'next_lesson'\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "save-lesson",
      "Save Lesson",
      "n8n-nodes-base.postgres",
      [-1488, 1152],
      {
        operation: "executeQuery",
        query:
          "insert into public.cb_saved_lessons (user_tg_id, lesson_id)\nvalues ('{{ $json.tg_id }}', '{{ $json.lesson_id }}')\non conflict (user_tg_id, lesson_id) do nothing;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "send-saved-confirmation",
      "Send Saved Confirmation",
      "n8n-nodes-base.telegram",
      [-1264, 1152],
      {
        chatId: "={{ $node['Normalize Callback Route'].json.chat_id }}",
        text: "=📌 Сохранил урок. К нему можно будет вернуться позже и быстро освежить ключевую мысль.",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "get-lesson-for-ai",
      "Get Lesson For AI",
      "n8n-nodes-base.postgres",
      [-1488, 1280],
      {
        operation: "executeQuery",
        query:
          "select\n  l.*,\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.message_id || '').replace(/'/g, \"''\") }}'::text as message_id,\n  '{{ String($json.current_message_text || '').replace(/'/g, \"''\") }}'::text as current_message_text,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key\nfrom public.cb_lessons l\nwhere l.id = '{{ $json.lesson_id }}'\nlimit 1;",
        options: {}
      },
      { typeVersion: 2.6 }
    ),
    node(
      "send-ai-suggestions",
      "Send AI Suggestions",
      "n8n-nodes-base.telegram",
      [-1264, 1280],
      {
        chatId: "={{ $json.chat_id }}",
        text:
          "=🧠 <b>{{ $json.title }}</b>\n\nВыбери готовый вопрос или просто напиши свой следующим сообщением. Можно и голосом.",
        replyMarkup: "inlineKeyboard",
        inlineKeyboard: {
          rows: [
            {
              row: {
                buttons: [
                  {
                    text: "Как это проявляется в жизни?",
                    additionalFields: {
                      callback_data: "=ai:suggest:{{ $json.id }}:life"
                    }
                  }
                ]
              }
            },
            {
              row: {
                buttons: [
                  {
                    text: "Как замечать это у себя?",
                    additionalFields: {
                      callback_data: "=ai:suggest:{{ $json.id }}:spot"
                    }
                  }
                ]
              }
            },
            {
              row: {
                buttons: [
                  {
                    text: "Что делать на практике?",
                    additionalFields: {
                      callback_data: "=ai:suggest:{{ $json.id }}:practice"
                    }
                  }
                ]
              }
            }
          ]
        },
        additionalFields: {
          appendAttribution: false,
          parse_mode: "HTML"
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "hide-ai-prompt-buttons",
      "Hide AI Prompt Buttons",
      "n8n-nodes-base.telegram",
      [-1488, 1408],
      {
        operation: "editMessageText",
        chatId: "={{ $json.chat_id }}",
        messageId: "={{ $json.message_id }}",
        text: "={{ $json.current_message_text || ' ' }}",
        additionalFields: {
          parse_mode: "HTML"
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "send-thinking-callback",
      "Send Thinking (Callback)",
      "n8n-nodes-base.telegram",
      [-1264, 1408],
      {
        chatId: "={{ $node['Normalize Callback Route'].json.chat_id }}",
        text: "Надо подумать, сейчас отвечу...",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "prepare-ai-suggest-input",
      "Prepare AI Suggest Input",
      "n8n-nodes-base.code",
      [-1040, 1408],
      {
        jsCode:
          "const source = $node['Normalize Callback Route']?.json || {};\nreturn [{\n  json: {\n    ...source,\n    message_type: 'text',\n    question_text: String(source.question_text || '').trim()\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "prepare-message-context",
      "Prepare Message Context",
      "n8n-nodes-base.code",
      [-2608, 1456],
      {
        jsCode:
          "const message = $json.message || {};\nconst text = String(message.text || message.caption || '').trim();\nconst entities = message.entities || [];\nconst isCommand = entities.some((entity) => entity.type === 'bot_command');\nconst startMatch = text.match(/^\\/start(?:\\s+(.+))?$/);\nconst route = message.voice ? 'voice' : (isCommand ? 'command' : (text ? 'text' : 'ignore'));\nreturn [{\n  json: {\n    ...$json,\n    tg_id: String(message.chat?.id || ''),\n    chat_id: String(message.chat?.id || ''),\n    first_name: message.from?.first_name || '',\n    last_name: message.from?.last_name || '',\n    tg_username: message.from?.username || '',\n    message_text: text,\n    route,\n    start_payload: startMatch?.[1] || '',\n    is_start: Boolean(startMatch)\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "message-route",
      "Message Route",
      "n8n-nodes-base.switch",
      [-2384, 1456],
      {
        rules: {
          values: [
            {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [
                  {
                    id: "route-command",
                    leftValue: "={{ $json.route }}",
                    rightValue: "command",
                    operator: { type: "string", operation: "equals" }
                  }
                ],
                combinator: "and"
              },
              renameOutput: true,
              outputKey: "command"
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [
                  {
                    id: "route-text",
                    leftValue: "={{ $json.route }}",
                    rightValue: "text",
                    operator: { type: "string", operation: "equals" }
                  }
                ],
                combinator: "and"
              },
              renameOutput: true,
              outputKey: "text"
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
                conditions: [
                  {
                    id: "route-voice",
                    leftValue: "={{ $json.route }}",
                    rightValue: "voice",
                    operator: { type: "string", operation: "equals" }
                  }
                ],
                combinator: "and"
              },
              renameOutput: true,
              outputKey: "voice"
            }
          ]
        },
        options: {}
      },
      { typeVersion: 3.2 }
    ),
    node(
      "is-start-command",
      "Is /start?",
      "n8n-nodes-base.if",
      [-2160, 1392],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "is-start-command-condition",
              leftValue: "={{ $json.is_start }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "send-unknown-command",
      "Send Unknown Command",
      "n8n-nodes-base.telegram",
      [-1936, 1504],
      {
        chatId: "={{ $json.chat_id }}",
        text: "=Сейчас бот понимает /start и вопросы по текущему уроку. Начни с /start, и я соберу для тебя маршрут по курсу.",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "get-start-user",
      "Get Start User",
      "n8n-nodes-base.postgres",
      [-1936, 1392],
      {
        operation: "executeQuery",
        query:
          "select\n  u.*,\n  l.id as lead_id,\n  l.email as lead_email,\n  coalesce(u.email, l.email) as email,\n  exists(\n    select 1\n    from public.cb_user_lessons ul\n    where ul.user_tg_id = u.tg_id\n  ) as has_lesson_queue,\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ String($json.last_name || '').replace(/'/g, \"''\") }}'::text as last_name,\n  '{{ String($json.tg_username || '').replace(/'/g, \"''\") }}'::text as tg_username,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.miniapp_url }}'::text as miniapp_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key,\n  '{{ String($json.start_payload || '').replace(/'/g, \"''\") }}'::text as start_payload\nfrom (select 1) seed\nleft join public.cb_users u on u.tg_id='{{ $json.tg_id }}'::text\nleft join public.cb_leads l on l.tg_username='{{ String($json.tg_username || '').replace(/'/g, \"''\") }}'\n  and l.email is not null\n  and l.email != ''\n  and l.tg_username is not null\n  and l.tg_username != ''\norder by u.id nulls last, l.created_at desc\nlimit 1;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "start-registered",
      "Start Registered?",
      "n8n-nodes-base.if",
      [-1712, 1392],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "start-email-exists",
              leftValue: "={{ !!$json.email }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "create-start-user",
      "Create Start User",
      "n8n-nodes-base.postgres",
      [-1488, 1520],
      {
        operation: "executeQuery",
        query:
          "with upserted as (\n  insert into public.cb_users (tg_id, tg_username, first_name, last_name, email, updated_at)\n  values (\n    '{{ $json.tg_id }}'::text,\n    {{ $json.tg_username ? \"'\" + String($json.tg_username).replace(/'/g, \"''\") + \"'\" : 'null' }},\n    {{ $json.first_name ? \"'\" + String($json.first_name).replace(/'/g, \"''\") + \"'\" : 'null' }},\n    {{ $json.last_name ? \"'\" + String($json.last_name).replace(/'/g, \"''\") + \"'\" : 'null' }},\n    {{ $json.email ? \"'\" + String($json.email).replace(/'/g, \"''\") + \"'\" : 'null' }},\n    now()\n  )\n  on conflict (tg_id) do update set\n    tg_username = excluded.tg_username,\n    first_name = coalesce(public.cb_users.first_name, excluded.first_name),\n    last_name = coalesce(public.cb_users.last_name, excluded.last_name),\n    email = coalesce(public.cb_users.email, excluded.email),\n    updated_at = now()\n  returning id, tg_id\n), bound_lead as (\n  update public.cb_leads\n  set bound_user_id = (select id from upserted),\n      tg_id = '{{ $json.tg_id }}'::text,\n      tg_username = coalesce({{ $json.tg_username ? \"'\" + String($json.tg_username).replace(/'/g, \"''\") + \"'\" : 'null' }}, public.cb_leads.tg_username)\n  where id = {{ $json.lead_id ? \"'\" + String($json.lead_id).replace(/'/g, \"''\") + \"'\" : 'null' }}::uuid\n  returning id\n)\nselect\n  (select tg_id from upserted) as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.miniapp_url }}'::text as miniapp_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key,\n  '{{ $json.has_lesson_queue ? \"true\" : \"false\" }}'::boolean as has_lesson_queue;",
        options: {}
      },
      { typeVersion: 2.6 }
    ),
    node(
      "start-has-lesson-queue",
      "Start Has Lesson Queue?",
      "n8n-nodes-base.if",
      [-1264, 1520],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "start-has-lesson-queue",
              leftValue: "={{ $json.has_lesson_queue === true }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "send-start-already-registered",
      "Send Start Already Registered",
      "n8n-nodes-base.telegram",
      [-1040, 1456],
      {
        chatId: "={{ $json.chat_id }}",
        text:
          "=👋 {{ $json.first_name || 'Привет' }}! Ты уже в системе.\n\nТекущий урок уже был отправлен раньше, так что можно просто продолжать с него.",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "send-start-greeting",
      "Send Start Greeting",
      "n8n-nodes-base.telegram",
      [-1488, 1328],
      {
        chatId: "={{ $json.chat_id }}",
        text:
          "=👋 {{ $json.first_name || 'Привет' }}! Добро пожаловать в курс по когнитивным искажениям.\n\nНиже — твой текущий шаг в курсе. Проходи последовательно: так карта, примеры и AI-подсказки складываются в цельную систему.",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "prepare-course-entry-start",
      "Prepare Course Entry (Start)",
      "n8n-nodes-base.code",
      [-1488, 1408],
      {
        jsCode:
          "const source = $node['Create Start User']?.json || {};\nreturn [{\n  json: {\n    ...source,\n    course_entry_source: 'start'\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "get-text-user",
      "Get Text User",
      "n8n-nodes-base.postgres",
      [-1936, 1648],
      {
        operation: "executeQuery",
        query:
          "select\n  u.*,\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ String($json.message_text || '').replace(/'/g, \"''\") }}'::text as message_text,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.miniapp_url }}'::text as miniapp_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key\nfrom (select 1) seed\nleft join public.cb_users u on u.tg_id='{{ $json.tg_id }}'::text\nlimit 1;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "text-registered",
      "Text Registered?",
      "n8n-nodes-base.if",
      [-1712, 1648],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "text-email-exists",
              leftValue: "={{ !!$json.email }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "send-thinking-message",
      "Send Thinking (Message)",
      "n8n-nodes-base.telegram",
      [-1488, 1648],
      {
        chatId: "={{ $node['Get Text User'].json.chat_id }}",
        text: "Надо подумать, сейчас отвечу...",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "prepare-ai-text-input",
      "Prepare AI Text Input",
      "n8n-nodes-base.code",
      [-1264, 1648],
      {
        jsCode:
          "const source = $node['Get Text User']?.json || {};\nreturn [{\n  json: {\n    ...source,\n    lesson_id: '',\n    message_type: 'text',\n    question_text: String(source.message_text || '').trim()\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "get-voice-user",
      "Get Voice User",
      "n8n-nodes-base.postgres",
      [-1936, 1808],
      {
        operation: "executeQuery",
        query:
          "select\n  u.*,\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.miniapp_url }}'::text as miniapp_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key\nfrom (select 1) seed\nleft join public.cb_users u on u.tg_id='{{ $json.tg_id }}'::text\nlimit 1;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "voice-registered",
      "Voice Registered?",
      "n8n-nodes-base.if",
      [-1712, 1808],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "voice-email-exists",
              leftValue: "={{ !!$json.email }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "send-thinking-voice",
      "Send Thinking (Voice)",
      "n8n-nodes-base.telegram",
      [-1488, 1808],
      {
        chatId: "={{ $node['Get Voice User'].json.chat_id }}",
        text: "Слушаю голосовой вопрос, сейчас разберу его в контексте урока...",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "get-voice-file",
      "Get Voice File",
      "n8n-nodes-base.telegram",
      [-1264, 1808],
      {
        resource: "file",
        fileId: "={{ $node[\"Telegram Trigger\"].json.message.voice.file_id }}",
        additionalFields: {}
      },
      { typeVersion: 1.2 }
    ),
    node(
      "transcribe-voice",
      "Transcribe Voice",
      "@n8n/n8n-nodes-langchain.openAi",
      [-1040, 1808],
      {
        resource: "audio",
        operation: "transcribe",
        options: {}
      },
      { typeVersion: 1.8 }
    ),
    node(
      "prepare-ai-voice-input",
      "Prepare AI Voice Input",
      "n8n-nodes-base.code",
      [-816, 1808],
      {
        jsCode:
          "return [{\n  json: {\n    ...$node['Get Voice User'].json,\n    lesson_id: '',\n    message_type: 'voice',\n    question_text: String($json.text || '').trim()\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "ensure-lesson-queue",
      "Ensure Lesson Queue",
      "n8n-nodes-base.postgres",
      [-816, 1296],
      {
        operation: "executeQuery",
        query:
          "with ins as (\n  insert into public.cb_user_lessons (user_tg_id, lesson_id, status)\n  select '{{ $json.tg_id }}'::text, l.id, 'new'\n  from public.cb_lessons l\n  where coalesce(l.published_at, now()) <= now()\n  on conflict (user_tg_id, lesson_id) do nothing\n  returning lesson_id\n)\nselect\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key,\n  count(*)::int as inserted_count\nfrom ins;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "activate-current-lesson",
      "Activate Current Lesson",
      "n8n-nodes-base.postgres",
      [-592, 1296],
      {
        operation: "executeQuery",
        query:
          "with target as (\n  select ul.id\n  from public.cb_user_lessons ul\n  join public.cb_lessons l on l.id = ul.lesson_id\n  where ul.user_tg_id = '{{ $json.tg_id }}'::text\n    and ul.status in ('new', 'in_progress')\n  order by case when ul.status = 'in_progress' then 0 else 1 end, l.sort_order asc\n  limit 1\n)\nupdate public.cb_user_lessons ul\nset status = 'in_progress',\n    last_opened_at = now()\nwhere ul.id in (select id from target)\nreturning ul.lesson_id,\n          '{{ $json.tg_id }}'::text as tg_id,\n          '{{ $json.chat_id }}'::text as chat_id,\n          '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n          '{{ $json.site_url }}'::text as site_url,\n          '{{ $json.quiz_url }}'::text as quiz_url,\n          '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n          '{{ $json.openrouter_model }}'::text as openrouter_model,\n          '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "get-current-lesson",
      "Get Current Lesson",
      "n8n-nodes-base.postgres",
      [-368, 1296],
      {
        operation: "executeQuery",
        query:
          "select\n  l.*,\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.first_name || '').replace(/'/g, \"''\") }}'::text as first_name,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key\nfrom public.cb_user_lessons ul\njoin public.cb_lessons l on l.id = ul.lesson_id\nwhere ul.user_tg_id = '{{ $json.tg_id }}'::text\n  and ul.status = 'in_progress'\norder by l.sort_order asc\nlimit 1;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "has-current-lesson",
      "Has Current Lesson?",
      "n8n-nodes-base.if",
      [-144, 1296],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "current-lesson-exists",
              leftValue: "={{ $json.id }}",
              rightValue: "",
              operator: { type: "string", operation: "exists", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "build-lesson-card",
      "Build Lesson Card",
      "n8n-nodes-base.code",
      [80, 1296],
      {
        jsCode:
          "const esc = (value) => String(value ?? '').replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));\nconst lesson = $json;\nconst parts = [`<b>${esc(lesson.title || 'Урок')}</b>`];\nif (lesson.short_text) parts.push(esc(lesson.short_text));\nif (lesson.full_text) parts.push(esc(lesson.full_text));\nconst atlasUrl = `${lesson.site_url || 'https://cognitive-biaces.vercel.app'}?focus=${lesson.slug}#atlas`;\nreturn [{\n  json: {\n    ...lesson,\n    atlas_url: atlasUrl,\n    lesson_text: parts.join('\\n\\n')\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "has-lesson-image",
      "Has Lesson Image?",
      "n8n-nodes-base.if",
      [304, 1296],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "lesson-image-exists",
              leftValue: "={{ Boolean($json.image_url) }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "send-lesson-photo",
      "Send Lesson Photo",
      "n8n-nodes-base.telegram",
      [528, 1216],
      {
        operation: "sendPhoto",
        chatId: "={{ $json.chat_id }}",
        file: "={{ $json.image_url }}",
        additionalFields: {}
      },
      { typeVersion: 1.2 }
    ),
    node(
      "send-lesson-card",
      "Send Lesson Card",
      "n8n-nodes-base.telegram",
      [752, 1296],
      {
        chatId: "={{ $node['Build Lesson Card'].json.chat_id }}",
        text: "={{ $node['Build Lesson Card'].json.lesson_text }}",
        replyMarkup: "inlineKeyboard",
        inlineKeyboard: {
          rows: [
            {
              row: {
                buttons: [
                  {
                    text: "Следующий",
                    additionalFields: {
                      callback_data: "=lesson:next:{{ $node['Build Lesson Card'].json.id }}"
                    }
                  },
                  {
                    text: "Атлас",
                    additionalFields: {
                      url: "={{ $node['Build Lesson Card'].json.atlas_url }}"
                    }
                  }
                ]
              }
            },
            {
              row: {
                buttons: [
                  {
                    text: "Сохранить",
                    additionalFields: {
                      callback_data: "=lesson:save:{{ $node['Build Lesson Card'].json.id }}"
                    }
                  },
                  {
                    text: "Спросить AI",
                    additionalFields: {
                      callback_data: "=lesson:ai:{{ $node['Build Lesson Card'].json.id }}"
                    }
                  }
                ]
              }
            }
          ]
        },
        additionalFields: {
          appendAttribution: false,
          parse_mode: "HTML"
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "send-course-complete",
      "Send Course Complete",
      "n8n-nodes-base.telegram",
      [80, 1456],
      {
        chatId: "={{ $json.chat_id }}",
        text:
          "=🎉 Ты дошел до конца текущего набора уроков.\n\nДальше можно закрепить материал на сайте: открыть квиз, пройти практику и вернуться к сохраненным искажениям.",
        replyMarkup: "inlineKeyboard",
        inlineKeyboard: {
          rows: [
            {
              row: {
                buttons: [
                  {
                    text: "Открыть квиз",
                    additionalFields: {
                      url: "={{ $json.quiz_url }}"
                    }
                  }
                ]
              }
            }
          ]
        },
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "resolve-ai-lesson",
      "Resolve AI Lesson",
      "n8n-nodes-base.postgres",
      [-816, 1664],
      {
        operation: "executeQuery",
        query:
          "select\n  l.*,\n  '{{ $json.tg_id }}'::text as tg_id,\n  '{{ $json.chat_id }}'::text as chat_id,\n  '{{ String($json.question_text || '').replace(/'/g, \"''\") }}'::text as question_text,\n  '{{ String($json.message_type || 'text').replace(/'/g, \"''\") }}'::text as message_type,\n  '{{ $json.site_url }}'::text as site_url,\n  '{{ $json.quiz_url }}'::text as quiz_url,\n  '{{ $json.openrouter_endpoint }}'::text as openrouter_endpoint,\n  '{{ $json.openrouter_model }}'::text as openrouter_model,\n  '{{ String($json.openrouter_api_key || '').replace(/'/g, \"''\") }}'::text as openrouter_api_key\nfrom public.cb_lessons l\nwhere l.id = coalesce(\n  {{ $json.lesson_id ? \"'\" + String($json.lesson_id).replace(/'/g, \"''\") + \"'\" : 'null' }}::text,\n  (\n    select ul.lesson_id\n    from public.cb_user_lessons ul\n    join public.cb_lessons cl on cl.id = ul.lesson_id\n    where ul.user_tg_id = '{{ $json.tg_id }}'\n      and ul.status = 'in_progress'\n    order by cl.sort_order asc\n    limit 1\n  ),\n  (\n    select ul.lesson_id\n    from public.cb_user_lessons ul\n    join public.cb_lessons cl on cl.id = ul.lesson_id\n    where ul.user_tg_id = '{{ $json.tg_id }}'\n      and ul.status = 'completed'\n    order by ul.completed_at desc nulls last, cl.sort_order asc\n    limit 1\n  )\n)\nlimit 1;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "has-ai-lesson",
      "Has AI Lesson?",
      "n8n-nodes-base.if",
      [-592, 1664],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "ai-lesson-exists",
              leftValue: "={{ $json.id }}",
              rightValue: "",
              operator: { type: "string", operation: "exists", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "send-no-lesson-yet",
      "Send No Lesson Yet",
      "n8n-nodes-base.telegram",
      [-368, 1792],
      {
        chatId: "={{ $json.chat_id }}",
        text: "=Сначала открой урок через /start, чтобы у AI появился контекст. После этого можно спрашивать сколько угодно.",
        additionalFields: {
          appendAttribution: false
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "ensure-ai-thread",
      "Ensure AI Thread",
      "n8n-nodes-base.postgres",
      [-368, 1664],
      {
        operation: "executeQuery",
        query:
          "insert into public.cb_ai_threads (user_tg_id, lesson_id, status, last_message_at)\nvalues ('{{ $json.tg_id }}', '{{ $json.id }}', 'active', now())\non conflict (user_tg_id, lesson_id)\ndo update set status = 'active', last_message_at = now()\nreturning id as thread_id,\n          '{{ $json.tg_id }}'::text as tg_id,\n          '{{ $json.chat_id }}'::text as chat_id,\n          '{{ $json.id }}'::text as lesson_id;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "get-ai-history",
      "Get AI History",
      "n8n-nodes-base.postgres",
      [-144, 1664],
      {
        operation: "executeQuery",
        query:
          "select role, message_text\nfrom public.cb_ai_messages\nwhere thread_id = '{{ $json.thread_id }}'\norder by created_at desc\nlimit 6;",
        options: {}
      },
      { typeVersion: 2.6, alwaysOutputData: true }
    ),
    node(
      "build-ai-prompt",
      "Build AI Prompt",
      "n8n-nodes-base.code",
      [80, 1744],
      {
        jsCode:
          "function safe(name) {\n  try {\n    return $node[name].json || null;\n  } catch (error) {\n    return null;\n  }\n}\nconst lesson = safe('Resolve AI Lesson') || {};\nconst thread = safe('Ensure AI Thread') || {};\nconst callbackInput = safe('Prepare AI Suggest Input');\nconst textInput = safe('Prepare AI Text Input');\nconst voiceInput = safe('Prepare AI Voice Input');\nconst source = callbackInput?.question_text ? callbackInput : (voiceInput?.question_text ? voiceInput : textInput || {});\nconst history = $items('Get AI History', 0).map((item) => item.json).filter((item) => item.message_text).reverse().map((item) => ({ role: item.role, content: item.message_text }));\nconst questionText = String(source.question_text || lesson.question_text || '').trim();\nconst firstName = source.first_name || lesson.first_name || 'друг';\nconst related = Array.isArray(lesson.related_slugs) ? lesson.related_slugs.join(', ') : String(lesson.related_slugs || '');\nconst systemPrompt = [\n  'Ты — практичный помощник курса по когнитивным искажениям.',\n  `Обращайся к пользователю по имени: ${firstName}.`,\n  `Текущий урок: ${lesson.title || ''}`,\n  lesson.short_text || '',\n  lesson.ai_context || '',\n  related ? `Связанные искажения: ${related}` : '',\n  'Отвечай по-русски, коротко, ясно и прикладно.',\n  'Опирайся на контекст урока, не выдумывай лишние факты.',\n  'Если полезно, дай 2-4 конкретных шага или вопроса для самопроверки.',\n  'Для Telegram используй только HTML-теги <b>, без markdown.'\n].filter(Boolean).join('\\n\\n');\nreturn [{\n  json: {\n    chat_id: lesson.chat_id || thread.chat_id || source.chat_id,\n    lesson_id: lesson.id || thread.lesson_id || source.lesson_id,\n    message_type: source.message_type || 'text',\n    openrouter_endpoint: lesson.openrouter_endpoint || source.openrouter_endpoint || 'https://openrouter.ai/api/v1/chat/completions',\n    openrouter_api_key: lesson.openrouter_api_key || source.openrouter_api_key || '',\n    provider: 'openrouter',\n    question_text: questionText,\n    request_body: {\n      model: lesson.openrouter_model || source.openrouter_model || 'qwen/qwen3-coder:free',\n      messages: [\n        { role: 'system', content: systemPrompt },\n        ...history,\n        { role: 'user', content: questionText || 'Помоги понять текущее искажение.' }\n      ]\n    },\n    site_url: lesson.site_url || source.site_url || 'https://cognitive-biaces.vercel.app',\n    tg_id: lesson.tg_id || thread.tg_id || source.tg_id,\n    thread_id: thread.thread_id,\n    system_prompt: systemPrompt\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "basic-llm-chain",
      "Basic LLM Chain",
      "@n8n/n8n-nodes-langchain.chainLlm",
      [304, 1744],
      {
        promptType: "define",
        text: "={{ $json.question_text }}",
        hasOutputParser: true,
        messages: {
          messageValues: [
            {
              message: "={{ $json.system_prompt }}"
            }
          ]
        },
        batching: {}
      },
      { typeVersion: 1.9 }
    ),
    node(
      "openrouter-chat-model",
      "OpenRouter Chat Model",
      "@n8n/n8n-nodes-langchain.lmChatOpenRouter",
      [304, 1968],
      {
        model: "qwen/qwen3-coder:free",
        options: {}
      },
      { typeVersion: 1 }
    ),
    node(
      "parse-ai-response",
      "Parse AI Response",
      "n8n-nodes-base.code",
      [528, 1744],
      {
        jsCode:
          "const source = $node['Build AI Prompt']?.json || {};\nconst answer = $json.text || $json.output || $json.response?.choices?.[0]?.message?.content || $json.answer_text || 'AI не вернул текстовый ответ.';\nreturn [{\n  json: {\n    ...source,\n    answer_text: String(answer).trim(),\n    model: $json.model || source.request_body?.model || 'unknown',\n    input_tokens: $json.response?.usage?.prompt_tokens || null,\n    output_tokens: $json.response?.usage?.completion_tokens || null,\n    status: $json.status || 'ok'\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "store-ai-user-message",
      "Store AI User Message",
      "n8n-nodes-base.postgres",
      [752, 1680],
      {
        operation: "executeQuery",
        query:
          "insert into public.cb_ai_messages (thread_id, role, message_text, message_type, provider, model)\nvalues (\n  '{{ $node[\"Parse AI Response\"].json.thread_id }}',\n  'user',\n  '{{ String($node[\"Parse AI Response\"].json.question_text || '').replace(/'/g, \"''\") }}',\n  '{{ String($node[\"Parse AI Response\"].json.message_type || 'text').replace(/'/g, \"''\") }}',\n  'telegram',\n  'input'\n);",
        options: {}
      },
      { typeVersion: 2.6 }
    ),
    node(
      "store-ai-assistant-message",
      "Store AI Assistant Message",
      "n8n-nodes-base.postgres",
      [976, 1680],
      {
        operation: "executeQuery",
        query:
          "insert into public.cb_ai_messages (thread_id, role, message_text, message_type, provider, model)\nvalues (\n  '{{ $node[\"Parse AI Response\"].json.thread_id }}',\n  'assistant',\n  '{{ String($node[\"Parse AI Response\"].json.answer_text || '').replace(/'/g, \"''\") }}',\n  'text',\n  'openrouter',\n  '{{ String($node[\"Parse AI Response\"].json.model || '').replace(/'/g, \"''\") }}'\n);\n\ninsert into public.cb_ai_usage (user_tg_id, lesson_id, provider, model, input_tokens, output_tokens, status)\nvalues (\n  '{{ $node[\"Parse AI Response\"].json.tg_id }}',\n  '{{ $node[\"Parse AI Response\"].json.lesson_id }}',\n  'openrouter',\n  '{{ String($node[\"Parse AI Response\"].json.model || '').replace(/'/g, \"''\") }}',\n  {{ $node[\"Parse AI Response\"].json.input_tokens || 'null' }},\n  {{ $node[\"Parse AI Response\"].json.output_tokens || 'null' }},\n  '{{ String($node[\"Parse AI Response\"].json.status || 'ok').replace(/'/g, \"''\") }}'\n);",
        options: {}
      },
      { typeVersion: 2.6 }
    ),
    node(
      "sanitize-html",
      "Sanitize for Telegram HTML",
      "n8n-nodes-base.code",
      [1200, 1680],
      {
        jsCode:
          "const source = $node['Parse AI Response']?.json || {};\nlet text = source.answer_text ?? source.text ?? '';\nif (typeof text !== 'string') text = String(text);\ntext = text.replace(/^###\\s*(.+)$/gm, '<b>$1</b>');\ntext = text.replace(/\\*\\*(.+?)\\*\\*/gs, '<b>$1</b>');\ntext = text.replace(/__(.+?)__/gs, '<b>$1</b>');\ntext = text.replace(/\\*(.+?)\\*/gs, '$1');\ntext = text.replace(/_(.+?)_/gs, '$1');\ntext = text.replace(/```+/g, '').replace(/`+/g, '');\ntext = text.replace(/\\\\n/g, '\\n');\ntext = text.replace(/<script[\\s\\S]*?<\\/script>/gi, '');\ntext = text.replace(/\\son\\w+=\"[^\"]*\"/gi, '');\ntext = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');\nfor (const tag of ['b','i','u','s','code','pre','a','tg-spoiler']) {\n  const open = new RegExp(`&lt;${tag}(\\\\s+[^&]*?)?&gt;`, 'gi');\n  const close = new RegExp(`&lt;\\\\/${tag}\\\\s*&gt;`, 'gi');\n  text = text.replace(open, (_m, attrs='') => `<${tag}${attrs}>`).replace(close, `</${tag}>`);\n}\nreturn [{ json: { ...source, answer_text: text } }];"
      },
      { typeVersion: 2 }
    ),
    node(
      "carry-ai-ctx",
      "Carry AI Context",
      "n8n-nodes-base.code",
      [1424, 1680],
      {
        jsCode:
          "return [{\n  json: {\n    ...$json,\n    chat_id: $json.chat_id,\n    lesson_id: $json.lesson_id,\n    message: $json.answer_text,\n    session_key: `${$json.chat_id || $json.tg_id || ''}_lesson_${$json.lesson_id || ''}`\n  }\n}];"
      },
      { typeVersion: 2 }
    ),
    node(
      "chunk-html",
      "Chunk for Telegram HTML",
      "n8n-nodes-base.code",
      [1648, 1680],
      {
        jsCode:
          "const MAX_LEN = 3500;\nconst input = items?.[0]?.json || {};\nconst raw = input.message || input.answer_text || '';\nconst chat_id = input.chat_id || input.tg_id || null;\nconst lesson_id = input.lesson_id || null;\nconst text = typeof raw === 'string' ? raw : String(raw);\nif (!text) return [];\nconst tokens = text.match(/<\\/?[a-zA-Z][^>]*>|[^<]+/g) || [];\nconst chunks = [];\nlet buffer = '';\nfor (const token of tokens) {\n  if ((buffer + token).length > MAX_LEN && buffer) {\n    chunks.push(buffer);\n    buffer = token;\n  } else {\n    buffer += token;\n  }\n}\nif (buffer) chunks.push(buffer);\nreturn chunks.map((message, index) => ({ json: { message, chat_id, lesson_id, is_last: index === chunks.length - 1 } }));"
      },
      { typeVersion: 2 }
    ),
    node(
      "loop-ai-chunks",
      "Loop Over Chunks",
      "n8n-nodes-base.splitInBatches",
      [1872, 1680],
      {
        options: {}
      },
      { typeVersion: 3 }
    ),
    node(
      "is-last-ai-chunk",
      "Is Last AI Chunk?",
      "n8n-nodes-base.if",
      [2096, 1680],
      {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "strict", version: 2 },
          conditions: [
            {
              id: "chunk-is-last",
              leftValue: "={{ $json.is_last === true }}",
              rightValue: "",
              operator: { type: "boolean", operation: "true", singleValue: true }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      { typeVersion: 2.2 }
    ),
    node(
      "send-ai-chunk",
      "Send AI Chunk",
      "n8n-nodes-base.telegram",
      [2320, 1744],
      {
        chatId: "={{ $json.chat_id }}",
        text: "={{ $json.message }}",
        additionalFields: {
          appendAttribution: false,
          parse_mode: "HTML"
        }
      },
      { typeVersion: 1.2 }
    ),
    node(
      "send-ai-final-chunk",
      "Send AI Final Chunk",
      "n8n-nodes-base.telegram",
      [2320, 1616],
      {
        chatId: "={{ $json.chat_id }}",
        text: "={{ $json.message }}",
        replyMarkup: "inlineKeyboard",
        inlineKeyboard: {
          rows: [
            {
              row: {
                buttons: [
                  {
                    text: "Следующий урок",
                    additionalFields: {
                      callback_data: "=lesson:next:{{ $json.lesson_id }}"
                    }
                  }
                ]
              }
            }
          ]
        },
        additionalFields: {
          appendAttribution: false,
          parse_mode: "HTML"
        }
      },
      { typeVersion: 1.2 }
    )
  ],
  connections: {
    "Telegram Trigger": {
      main: [[{ node: "Attach Config (Telegram)", type: "main", index: 0 }]]
    },
    "Miniapp Registration Webhook": {
      main: [[{ node: "Attach Config (Webhook)", type: "main", index: 0 }]]
    },
    "Attach Config (Webhook)": {
      main: [[{ node: "Webhook Secret Valid?", type: "main", index: 0 }]]
    },
    "Webhook Secret Valid?": {
      main: [
        [{ node: "Send Registration Complete", type: "main", index: 0 }],
        [{ node: "Webhook Invalid", type: "main", index: 0 }]
      ]
    },
    "Send Registration Complete": {
      main: [[{ node: "Prepare Course Entry (Webhook)", type: "main", index: 0 }]]
    },
    "Prepare Course Entry (Webhook)": {
      main: [[{ node: "Get Webhook User", type: "main", index: 0 }]]
    },
    "Get Webhook User": {
      main: [[{ node: "Webhook User Exists?", type: "main", index: 0 }]]
    },
    "Webhook User Exists?": {
      main: [
        [{ node: "Prepare Course Entry (Webhook User)", type: "main", index: 0 }],
        [{ node: "Create Webhook User", type: "main", index: 0 }]
      ]
    },
    "Create Webhook User": {
      main: [[{ node: "Prepare Course Entry (Webhook User)", type: "main", index: 0 }]]
    },
    "Prepare Course Entry (Webhook User)": {
      main: [[{ node: "Ensure Lesson Queue", type: "main", index: 0 }]]
    },
    "Attach Config (Telegram)": {
      main: [[{ node: "Is Callback?", type: "main", index: 0 }]]
    },
    "Is Callback?": {
      main: [
        [{ node: "Prepare Callback Context", type: "main", index: 0 }],
        [{ node: "Prepare Message Context", type: "main", index: 0 }]
      ]
    },
    "Prepare Callback Context": {
      main: [
        [
          { node: "Answer Callback", type: "main", index: 0 },
          { node: "Get Callback User", type: "main", index: 0 }
        ]
      ]
    },
    "Get Callback User": {
      main: [[{ node: "Callback Registered?", type: "main", index: 0 }]]
    },
    "Callback Registered?": {
      main: [
        [{ node: "Normalize Callback Route", type: "main", index: 0 }],
        [{ node: "Send Registration Prompt", type: "main", index: 0 }]
      ]
    },
    "Normalize Callback Route": {
      main: [[{ node: "Callback Route", type: "main", index: 0 }]]
    },
    "Callback Route": {
      main: [
        [{ node: "Freeze Lesson Card", type: "main", index: 0 }],
        [{ node: "Save Lesson", type: "main", index: 0 }],
        [{ node: "Get Lesson For AI", type: "main", index: 0 }],
        [{ node: "Hide AI Prompt Buttons", type: "main", index: 0 }]
      ]
    },
    "Freeze Lesson Card": {
      main: [[{ node: "Complete Lesson", type: "main", index: 0 }]]
    },
    "Complete Lesson": {
      main: [[{ node: "Prepare Course Entry (Callback)", type: "main", index: 0 }]]
    },
    "Prepare Course Entry (Callback)": {
      main: [[{ node: "Ensure Lesson Queue", type: "main", index: 0 }]]
    },
    "Save Lesson": {
      main: [[{ node: "Send Saved Confirmation", type: "main", index: 0 }]]
    },
    "Get Lesson For AI": {
      main: [[{ node: "Send AI Suggestions", type: "main", index: 0 }]]
    },
    "Hide AI Prompt Buttons": {
      main: [[{ node: "Send Thinking (Callback)", type: "main", index: 0 }]]
    },
    "Send Thinking (Callback)": {
      main: [[{ node: "Prepare AI Suggest Input", type: "main", index: 0 }]]
    },
    "Prepare AI Suggest Input": {
      main: [[{ node: "Resolve AI Lesson", type: "main", index: 0 }]]
    },
    "Prepare Message Context": {
      main: [[{ node: "Message Route", type: "main", index: 0 }]]
    },
    "Message Route": {
      main: [
        [{ node: "Is /start?", type: "main", index: 0 }],
        [{ node: "Get Text User", type: "main", index: 0 }],
        [{ node: "Get Voice User", type: "main", index: 0 }]
      ]
    },
    "Is /start?": {
      main: [
        [{ node: "Get Start User", type: "main", index: 0 }],
        [{ node: "Send Unknown Command", type: "main", index: 0 }]
      ]
    },
    "Get Start User": {
      main: [[{ node: "Start Registered?", type: "main", index: 0 }]]
    },
    "Start Registered?": {
      main: [
        [{ node: "Create Start User", type: "main", index: 0 }],
        [{ node: "Send Registration Prompt", type: "main", index: 0 }]
      ]
    },
    "Create Start User": {
      main: [[{ node: "Start Has Lesson Queue?", type: "main", index: 0 }]]
    },
    "Start Has Lesson Queue?": {
      main: [
        [{ node: "Send Start Already Registered", type: "main", index: 0 }],
        [{ node: "Send Start Greeting", type: "main", index: 0 }]
      ]
    },
    "Send Start Greeting": {
      main: [[{ node: "Prepare Course Entry (Start)", type: "main", index: 0 }]]
    },
    "Prepare Course Entry (Start)": {
      main: [[{ node: "Ensure Lesson Queue", type: "main", index: 0 }]]
    },
    "Get Text User": {
      main: [[{ node: "Text Registered?", type: "main", index: 0 }]]
    },
    "Text Registered?": {
      main: [
        [{ node: "Send Thinking (Message)", type: "main", index: 0 }],
        [{ node: "Send Registration Prompt", type: "main", index: 0 }]
      ]
    },
    "Send Thinking (Message)": {
      main: [[{ node: "Prepare AI Text Input", type: "main", index: 0 }]]
    },
    "Prepare AI Text Input": {
      main: [[{ node: "Resolve AI Lesson", type: "main", index: 0 }]]
    },
    "Get Voice User": {
      main: [[{ node: "Voice Registered?", type: "main", index: 0 }]]
    },
    "Voice Registered?": {
      main: [
        [{ node: "Send Thinking (Voice)", type: "main", index: 0 }],
        [{ node: "Send Registration Prompt", type: "main", index: 0 }]
      ]
    },
    "Send Thinking (Voice)": {
      main: [[{ node: "Get Voice File", type: "main", index: 0 }]]
    },
    "Get Voice File": {
      main: [[{ node: "Transcribe Voice", type: "main", index: 0 }]]
    },
    "Transcribe Voice": {
      main: [[{ node: "Prepare AI Voice Input", type: "main", index: 0 }]]
    },
    "Prepare AI Voice Input": {
      main: [[{ node: "Resolve AI Lesson", type: "main", index: 0 }]]
    },
    "Ensure Lesson Queue": {
      main: [[{ node: "Activate Current Lesson", type: "main", index: 0 }]]
    },
    "Activate Current Lesson": {
      main: [[{ node: "Get Current Lesson", type: "main", index: 0 }]]
    },
    "Get Current Lesson": {
      main: [[{ node: "Has Current Lesson?", type: "main", index: 0 }]]
    },
    "Has Current Lesson?": {
      main: [
        [{ node: "Build Lesson Card", type: "main", index: 0 }],
        [{ node: "Send Course Complete", type: "main", index: 0 }]
      ]
    },
    "Build Lesson Card": {
      main: [[{ node: "Has Lesson Image?", type: "main", index: 0 }]]
    },
    "Has Lesson Image?": {
      main: [
        [{ node: "Send Lesson Photo", type: "main", index: 0 }],
        [{ node: "Send Lesson Card", type: "main", index: 0 }]
      ]
    },
    "Send Lesson Photo": {
      main: [[{ node: "Send Lesson Card", type: "main", index: 0 }]]
    },
    "Resolve AI Lesson": {
      main: [[{ node: "Has AI Lesson?", type: "main", index: 0 }]]
    },
    "Has AI Lesson?": {
      main: [
        [{ node: "Ensure AI Thread", type: "main", index: 0 }],
        [{ node: "Send No Lesson Yet", type: "main", index: 0 }]
      ]
    },
    "Ensure AI Thread": {
      main: [[{ node: "Get AI History", type: "main", index: 0 }]]
    },
    "Get AI History": {
      main: [[{ node: "Build AI Prompt", type: "main", index: 0 }]]
    },
    "Build AI Prompt": {
      main: [[{ node: "Basic LLM Chain", type: "main", index: 0 }]]
    },
    "OpenRouter Chat Model": {
      ai_languageModel: [[{ node: "Basic LLM Chain", type: "ai_languageModel", index: 0 }]]
    },
    "Basic LLM Chain": {
      main: [[{ node: "Parse AI Response", type: "main", index: 0 }]]
    },
    "Parse AI Response": {
      main: [[{ node: "Store AI User Message", type: "main", index: 0 }]]
    },
    "Store AI User Message": {
      main: [[{ node: "Store AI Assistant Message", type: "main", index: 0 }]]
    },
    "Store AI Assistant Message": {
      main: [[{ node: "Sanitize for Telegram HTML", type: "main", index: 0 }]]
    },
    "Sanitize for Telegram HTML": {
      main: [[{ node: "Carry AI Context", type: "main", index: 0 }]]
    },
    "Carry AI Context": {
      main: [[{ node: "Chunk for Telegram HTML", type: "main", index: 0 }]]
    },
    "Chunk for Telegram HTML": {
      main: [[{ node: "Loop Over Chunks", type: "main", index: 0 }]]
    },
    "Loop Over Chunks": {
      main: [
        [],
        [{ node: "Is Last AI Chunk?", type: "main", index: 0 }]
      ]
    },
    "Is Last AI Chunk?": {
      main: [
        [
          { node: "Send AI Final Chunk", type: "main", index: 0 },
          { node: "Loop Over Chunks", type: "main", index: 0 }
        ],
        [
          { node: "Send AI Chunk", type: "main", index: 0 }
        ]
      ]
    },
    "Send AI Chunk": {
      main: [[{ node: "Loop Over Chunks", type: "main", index: 0 }]]
    },
    "Send AI Final Chunk": {
      main: [[{ node: "Loop Over Chunks", type: "main", index: 0 }]]
    }
  },
  pinData: {},
  active: false,
  settings: {},
  versionId: "cognitive-biases-atlas-v2",
  meta: {
    templateCredsSetupCompleted: false,
    instanceId: "cognitive-biases-atlas"
  }
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2) + "\n", "utf8");
console.log(`Wrote ${outputPath}`);
