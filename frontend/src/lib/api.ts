import axios, {
  type AxiosInstance,
  type AxiosProgressEvent,
  type AxiosRequestConfig,
  isAxiosError,
} from 'axios'

const defaultBaseUrl = '/api'

const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? defaultBaseUrl,
  withCredentials: true,
})

const unwrap = async <T>(promise: Promise<{ data: T }>): Promise<T> => {
  const response = await promise
  return response.data
}

const withProgress = (
  onProgress?: (progress: number) => void
): ((event: AxiosProgressEvent) => void) | undefined => {
  if (!onProgress) {
    return undefined
  }

  return (event: AxiosProgressEvent) => {
    if (!event.total) {
      return
    }

    const progress = Math.round((event.loaded * 100) / event.total)
    onProgress(progress)
  }
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(client.get<T>(url, config)),
  post: <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(client.post<T>(url, data, config)),
  put: <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(client.put<T>(url, data, config)),
  patch: <T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(client.patch<T>(url, data, config)),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(client.delete<T>(url, config)),
  upload: async <T>(
    url: string,
    payload: FormData | File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig<FormData>
  ): Promise<T> => {
    const body = payload instanceof FormData ? payload : (() => {
      const formData = new FormData()
      formData.append('file', payload)
      return formData
    })()

    const response = await client.post<T>(url, body, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: withProgress(onProgress),
    })

    return response.data
  },
  isAxiosError,
}
