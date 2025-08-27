import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import { Card, CardHeader, CardBody, CardFooter } from '../Card'

describe('Card', () => {
  describe('Card Component', () => {
    it('renders with default props', () => {
      render(<Card>Card Content</Card>)
      const card = screen.getByText('Card Content').closest('div')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-soft', 'border', 'border-gray-200', 'overflow-hidden')
    })

    it('renders with custom className', () => {
      render(<Card className="custom-card-class">Custom Card</Card>)
      const card = screen.getByText('Custom Card').closest('div')
      expect(card).toHaveClass('custom-card-class')
    })

    it('forwards additional props', () => {
      render(
        <Card 
          data-testid="test-card"
          aria-label="Test card"
          role="article"
        >
          Card with Props
        </Card>
      )
      const card = screen.getByTestId('test-card')
      expect(card).toHaveAttribute('aria-label', 'Test card')
      expect(card).toHaveAttribute('role', 'article')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<Card ref={ref}>Ref Card</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('renders without children', () => {
      render(<Card>{null}</Card>)
      const card = document.querySelector('.bg-white.rounded-xl.shadow-soft')
      expect(card).toBeInTheDocument()
    })
  })

  describe('CardHeader Component', () => {
    it('renders with default props', () => {
      render(<CardHeader>Header Content</CardHeader>)
      const header = screen.getByText('Header Content').closest('div')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('px-6', 'py-4', 'border-b', 'border-gray-200', 'bg-gray-50')
    })

    it('renders with custom className', () => {
      render(<CardHeader className="custom-header-class">Custom Header</CardHeader>)
      const header = screen.getByText('Custom Header').closest('div')
      expect(header).toHaveClass('custom-header-class')
    })

    it('forwards additional props', () => {
      render(
        <CardHeader 
          data-testid="test-header"
          aria-label="Test header"
          role="banner"
        >
          Header with Props
        </CardHeader>
      )
      const header = screen.getByTestId('test-header')
      expect(header).toHaveAttribute('aria-label', 'Test header')
      expect(header).toHaveAttribute('role', 'banner')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<CardHeader ref={ref}>Ref Header</CardHeader>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardBody Component', () => {
    it('renders with default props', () => {
      render(<CardBody>Body Content</CardBody>)
      const body = screen.getByText('Body Content').closest('div')
      expect(body).toBeInTheDocument()
      expect(body).toHaveClass('px-6', 'py-4')
    })

    it('renders with custom className', () => {
      render(<CardBody className="custom-body-class">Custom Body</CardBody>)
      const body = screen.getByText('Custom Body').closest('div')
      expect(body).toHaveClass('custom-body-class')
    })

    it('forwards additional props', () => {
      render(
        <CardBody 
          data-testid="test-body"
          aria-label="Test body"
          role="main"
        >
          Body with Props
        </CardBody>
      )
      const body = screen.getByTestId('test-body')
      expect(body).toHaveAttribute('aria-label', 'Test body')
      expect(body).toHaveAttribute('role', 'main')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<CardBody ref={ref}>Ref Body</CardBody>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('CardFooter Component', () => {
    it('renders with default props', () => {
      render(<CardFooter>Footer Content</CardFooter>)
      const footer = screen.getByText('Footer Content').closest('div')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('px-6', 'py-4', 'border-t', 'border-gray-200', 'bg-gray-50')
    })

    it('renders with custom className', () => {
      render(<CardFooter className="custom-footer-class">Custom Footer</CardFooter>)
      const footer = screen.getByText('Custom Footer').closest('div')
      expect(footer).toHaveClass('custom-footer-class')
    })

    it('forwards additional props', () => {
      render(
        <CardFooter 
          data-testid="test-footer"
          aria-label="Test footer"
          role="contentinfo"
        >
          Footer with Props
        </CardFooter>
      )
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveAttribute('aria-label', 'Test footer')
      expect(footer).toHaveAttribute('role', 'contentinfo')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(<CardFooter ref={ref}>Ref Footer</CardFooter>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Card Composition', () => {
    it('renders complete card with all sections', () => {
      render(
        <Card>
          <CardHeader>Card Title</CardHeader>
          <CardBody>Card content goes here</CardBody>
          <CardFooter>Card actions</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByText('Card actions')).toBeInTheDocument()
    })

    it('renders card with only header and body', () => {
      render(
        <Card>
          <CardHeader>Title Only</CardHeader>
          <CardBody>Content only</CardBody>
        </Card>
      )
      
      expect(screen.getByText('Title Only')).toBeInTheDocument()
      expect(screen.getByText('Content only')).toBeInTheDocument()
    })

    it('renders card with only body and footer', () => {
      render(
        <Card>
          <CardBody>Content only</CardBody>
          <CardFooter>Footer only</CardFooter>
        </Card>
      )
      
      expect(screen.getByText('Content only')).toBeInTheDocument()
      expect(screen.getByText('Footer only')).toBeInTheDocument()
    })

    it('renders card with only body', () => {
      render(
        <Card>
          <CardBody>Simple content</CardBody>
        </Card>
      )
      
      expect(screen.getByText('Simple content')).toBeInTheDocument()
    })

    it('maintains proper styling hierarchy', () => {
      render(
        <Card className="main-card">
          <CardHeader className="header-style">Header</CardHeader>
          <CardBody className="body-style">Body</CardBody>
          <CardFooter className="footer-style">Footer</CardFooter>
        </Card>
      )
      
      const card = document.querySelector('.main-card')
      const header = document.querySelector('.header-style')
      const body = document.querySelector('.body-style')
      const footer = document.querySelector('.footer-style')
      
      expect(card).toContainElement(header)
      expect(card).toContainElement(body)
      expect(card).toContainElement(footer)
    })
  })

  describe('Accessibility', () => {
    it('maintains proper semantic structure', () => {
      render(
        <Card role="article">
          <CardHeader role="banner">Accessible Header</CardHeader>
          <CardBody role="main">Accessible Content</CardBody>
          <CardFooter role="contentinfo">Accessible Footer</CardFooter>
        </Card>
      )
      
      expect(screen.getByRole('article')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('supports custom ARIA attributes', () => {
      render(
        <Card aria-labelledby="card-title">
          <CardHeader>
            <h2 id="card-title">Card Title</h2>
          </CardHeader>
          <CardBody>Content</CardBody>
        </Card>
      )
      
      const card = document.querySelector('[aria-labelledby="card-title"]')
      expect(card).toHaveAttribute('aria-labelledby', 'card-title')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Card>{null}</Card>)
      // The Card should still render with its container div and classes
      const cardContainer = document.querySelector('.bg-white.rounded-xl.shadow-soft')
      expect(cardContainer).toBeInTheDocument()
    })

    it('handles multiple children of same type', () => {
      render(
        <Card>
          <CardBody>First Body</CardBody>
          <CardBody>Second Body</CardBody>
        </Card>
      )
      
      expect(screen.getByText('First Body')).toBeInTheDocument()
      expect(screen.getByText('Second Body')).toBeInTheDocument()
    })

    it('handles deeply nested content', () => {
      render(
        <Card>
          <CardHeader>
            <h1>Deep Title</h1>
          </CardHeader>
          <CardBody>
            <div>
              <p>Nested content</p>
              <ul>
                <li>List item 1</li>
                <li>List item 2</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      )
      
      expect(screen.getByText('Deep Title')).toBeInTheDocument()
      expect(screen.getByText('Nested content')).toBeInTheDocument()
      expect(screen.getByText('List item 1')).toBeInTheDocument()
      expect(screen.getByText('List item 2')).toBeInTheDocument()
    })
  })
})
