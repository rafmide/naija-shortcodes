import 'hono/jsx'

declare module 'hono/jsx' {
  namespace JSX {
    interface HTMLAttributes {
      [key: `hx-${string}`]: string | undefined
    }
  }
}
