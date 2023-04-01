import { fetchChatCompletion } from './api'
import { parseStream } from './parser'
import type { Provider } from '@/types/provider'

// const res = {
//   id: 'chatcmpl-6xxS3BQdz1ALgkGvqVQDKedReeNLY',
//   object: 'chat.completion',
//   created: 1679747903,
//   model: 'gpt-3.5-turbo-0301',
//   usage: { prompt_tokens: 9, completion_tokens: 9, total_tokens: 18 },
//   choices: [
//     { message: { role: 'assistant', content: 'Hello! How can I assist you today?' }, finish_reason: 'stop', index: 0 }
//   ],
// }

export const handleSinglePrompt: Provider['handleSinglePrompt'] = async(prompt, payload) => {
  const response = await fetchChatCompletion({
    apiKey: payload.globalSettings.apiKey as string,
    baseUrl: (payload.globalSettings.baseUrl as string || 'https://api.openai.com').trim().replace(/\/$/, ''),
    body: {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      stream: true,
    },
  })
  console.log(response)
  if (!response.ok) {
    const responseJson = await response.json()
    const errMessage = responseJson.error?.message || 'Unknown error'
    throw new Error(errMessage)
  }
  const isStream = response.headers.get('content-type')?.includes('text/event-stream')
  if (isStream) {
    return parseStream(response)
  } else {
    const resJson = await response.json()
    const resText = resJson.choices[0].message.content

    return resText
  }
}

export const handleContinuousPrompt: Provider['handleContinuousPrompt'] = async(messages, payload) => {
  const response = await fetchChatCompletion({
    apiKey: payload.globalSettings.apiKey as string,
    baseUrl: (payload.globalSettings.baseUrl as string || 'https://api.openai.com').trim().replace(/\/$/, ''),
    body: {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.6,
      // stream: true,
    },
  })
  if (!response.ok) {
    const responseJson = await response.json()
    const errMessage = responseJson.error?.message || 'Unknown error'
    throw new Error(errMessage)
  }

  const resJson = await response.json()
  const resText = resJson.choices[0].message.content

  return resText
}
