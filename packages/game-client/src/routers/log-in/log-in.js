export default function LoginRouter() {
  // Redirect to account site
  window.location = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://incorporated.gg'
  return null
}
