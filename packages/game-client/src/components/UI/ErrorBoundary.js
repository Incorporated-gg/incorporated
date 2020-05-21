import React from 'react'
import PropTypes from 'prop-types'
import * as Sentry from '@sentry/browser'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: false }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo)
    Sentry.withScope(scope => {
      scope.setExtras(errorInfo)
      const eventId = Sentry.captureException(error)
      this.setState({ eventId })
    })
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h1>Algo salió mal.</h1>
          <pre>{this.state.error.message}</pre>
          <button onClick={() => Sentry.showReportDialog({ eventId: this.state.eventId })}>Report feedback</button>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
}
export default ErrorBoundary
