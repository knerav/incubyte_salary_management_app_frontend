import '@testing-library/jest-dom'

// Radix UI uses pointer capture APIs not implemented in jsdom
window.HTMLElement.prototype.hasPointerCapture = jest.fn()
window.HTMLElement.prototype.setPointerCapture = jest.fn()
window.HTMLElement.prototype.releasePointerCapture = jest.fn()
window.HTMLElement.prototype.scrollIntoView = jest.fn()
