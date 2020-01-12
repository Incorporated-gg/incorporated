import React from 'react'
import PropTypes from 'prop-types'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: false }
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.error) {
      // Puedes renderizar cualquier interfaz de repuesto
      return (
        <div>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.message}</pre>
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
