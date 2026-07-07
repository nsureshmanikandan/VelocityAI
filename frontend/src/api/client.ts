import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default client
