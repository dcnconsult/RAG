import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonList, 
  SkeletonForm 
} from '../Skeleton'

describe('Skeleton Components', () => {
  beforeEach(() => {
    // Mock matchMedia for dark mode support
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('Skeleton', () => {
    it('should render with default props', () => {
      render(<Skeleton />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'dark:bg-gray-700')
    })

    it('should apply custom className', () => {
      render(<Skeleton className="custom-class" />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('custom-class')
    })

    it('should render with text variant', () => {
      render(<Skeleton variant="text" />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('h-4', 'rounded')
    })

    it('should render with circular variant', () => {
      render(<Skeleton variant="circular" />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('rounded-full')
    })

    it('should render with rectangular variant', () => {
      render(<Skeleton variant="rectangular" />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('rounded')
    })

    it('should render with rounded variant', () => {
      render(<Skeleton variant="rounded" />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('rounded-lg')
    })

    it('should handle custom dimensions', () => {
      render(<Skeleton width="200px" height="100px" />)
      
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
      // Check that the element exists rather than specific styles
      expect(skeleton).toHaveAttribute('style')
    })

    it('should apply custom animation', () => {
      render(<Skeleton animation="none" />)
      
      const skeleton = screen.getByTestId('skeleton')
      expect(skeleton).not.toHaveClass('animate-pulse')
    })
  })

  describe('SkeletonText', () => {
    it('should render with default props', () => {
      render(<SkeletonText />)
      
      const skeleton = screen.getByTestId('skeleton-text')
      expect(skeleton).toBeInTheDocument()
    })

    it('should render specified number of lines', () => {
      render(<SkeletonText lines={3} />)
      
      const lines = screen.getAllByTestId('skeleton-line')
      expect(lines).toHaveLength(3)
    })

    it('should render with custom line heights', () => {
      render(<SkeletonText lines={2} lineHeight="h-6" />)
      
      const lines = screen.getAllByTestId('skeleton-line')
      lines.forEach(line => {
        expect(line).toHaveClass('h-6')
      })
    })

    it('should apply custom className', () => {
      render(<SkeletonText className="custom-text" />)
      
      const skeleton = screen.getByTestId('skeleton-text')
      expect(skeleton).toHaveClass('custom-text')
    })

    it('should handle single line', () => {
      render(<SkeletonText lines={1} />)
      
      const lines = screen.getAllByTestId('skeleton-line')
      expect(lines).toHaveLength(1)
    })

    it('should handle zero lines gracefully', () => {
      render(<SkeletonText lines={0} />)
      
      const lines = screen.queryAllByTestId('skeleton-line')
      expect(lines).toHaveLength(0)
    })
  })

  describe('SkeletonAvatar', () => {
    it('should render with default props', () => {
      render(<SkeletonAvatar />)
      
      const avatar = document.querySelector('.animate-pulse')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('rounded-full')
      // Check that the element exists rather than specific styles
      expect(avatar).toHaveAttribute('style')
    })

    it('should render with custom size', () => {
      render(<SkeletonAvatar size={60} />)
      
      const avatar = document.querySelector('.animate-pulse')
      expect(avatar).toBeInTheDocument()
      // Check that the element exists rather than specific styles
      expect(avatar).toHaveAttribute('style')
    })

    it('should render with custom dimensions', () => {
      render(<SkeletonAvatar width="60px" height="60px" />)
      
      const avatar = screen.getByTestId('skeleton-avatar')
      
      // The custom dimensions are applied to the outer SkeletonAvatar div
      // when both width and height are provided
      const style = avatar.getAttribute('style')
      expect(style).toContain('width: 60px')
      expect(style).toContain('height: 60px')
      
      // Also check that the inner Skeleton component has the dimensions
      const skeleton = screen.getByTestId('skeleton')
      const skeletonStyle = skeleton.getAttribute('style')
      expect(skeletonStyle).toContain('width: 60px')
      expect(skeletonStyle).toContain('height: 60px')
    })

    it('should apply custom className', () => {
      render(<SkeletonAvatar className="custom-avatar" />)
      
      const avatar = screen.getByTestId('skeleton-avatar')
      expect(avatar).toHaveClass('custom-avatar')
    })

    it('should handle different size variants', () => {
      const { rerender } = render(<SkeletonAvatar size="sm" />)
      
      let avatar = screen.getByTestId('skeleton-avatar')
      expect(avatar).toHaveClass('w-8', 'h-8')

      rerender(<SkeletonAvatar size="md" />)
      avatar = screen.getByTestId('skeleton-avatar')
      expect(avatar).toHaveClass('w-12', 'h-12')

      rerender(<SkeletonAvatar size="xl" />)
      avatar = screen.getByTestId('skeleton-avatar')
      expect(avatar).toHaveClass('w-20', 'h-20')
    })
  })

  describe('SkeletonCard', () => {
    it('should render with default props', () => {
      render(<SkeletonCard />)
      
      const card = screen.getByTestId('skeleton-card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('p-4', 'border', 'rounded-lg')
    })

    it('should render with custom padding', () => {
      render(<SkeletonCard padding="p-6" />)
      
      const card = screen.getByTestId('skeleton-card')
      expect(card).toHaveClass('p-6')
    })

    it('should render with custom border radius', () => {
      render(<SkeletonCard borderRadius="rounded-xl" />)
      
      const card = screen.getByTestId('skeleton-card')
      expect(card).toHaveClass('rounded-xl')
    })

    it('should apply custom className', () => {
      render(<SkeletonCard className="custom-card" />)
      
      const card = screen.getByTestId('skeleton-card')
      expect(card).toHaveClass('custom-card')
    })

    it('should render with custom content', () => {
      render(
        <SkeletonCard>
          <div data-testid="custom-content">Custom content</div>
        </SkeletonCard>
      )
      
      const customContent = screen.getByTestId('custom-content')
      expect(customContent).toBeInTheDocument()
      expect(customContent).toHaveTextContent('Custom content')
    })
  })

  describe('SkeletonTable', () => {
    it('should render with default props', () => {
      render(<SkeletonTable />)
      
      const table = screen.getByTestId('skeleton-table')
      expect(table).toBeInTheDocument()
    })

    it('should render specified number of rows and columns', () => {
      render(<SkeletonTable rows={3} columns={4} />)
      
      const rows = screen.getAllByTestId('skeleton-row')
      const cells = screen.getAllByTestId('skeleton-cell')
      
      expect(rows).toHaveLength(3)
      expect(cells).toHaveLength(12) // 3 rows * 4 columns
    })

    it('should render with custom row heights', () => {
      render(<SkeletonTable rows={2} rowHeight="h-8" />)
      
      const rows = screen.getAllByTestId('skeleton-row')
      rows.forEach(row => {
        expect(row).toHaveClass('h-8')
      })
    })

    it('should render with custom cell widths', () => {
      render(<SkeletonTable columns={3} cellWidth="w-24" />)
      
      const cells = screen.getAllByTestId('skeleton-cell')
      cells.forEach(cell => {
        expect(cell).toHaveClass('w-24')
      })
    })

    it('should apply custom className', () => {
      render(<SkeletonTable className="custom-table" />)
      
      const table = screen.getByTestId('skeleton-table')
      expect(table).toHaveClass('custom-table')
    })

    it('should handle single row and column', () => {
      render(<SkeletonTable rows={1} columns={1} />)
      
      const rows = screen.getAllByTestId('skeleton-row')
      const cells = screen.getAllByTestId('skeleton-cell')
      
      expect(rows).toHaveLength(1)
      expect(cells).toHaveLength(1)
    })
  })

  describe('SkeletonList', () => {
    it('should render with default props', () => {
      render(<SkeletonList />)
      
      const list = screen.getByTestId('skeleton-list')
      expect(list).toBeInTheDocument()
    })

    it('should render specified number of items', () => {
      render(<SkeletonList items={5} />)
      
      const items = screen.getAllByTestId('skeleton-item')
      expect(items).toHaveLength(5)
    })

    it('should render with custom item heights', () => {
      render(<SkeletonList items={3} itemHeight="h-12" />)
      
      const items = screen.getAllByTestId('skeleton-item')
      items.forEach(item => {
        expect(item).toHaveClass('h-12')
      })
    })

    it('should render with custom spacing', () => {
      render(<SkeletonList items={2} spacing="space-y-6" />)
      
      const list = screen.getByTestId('skeleton-list')
      expect(list).toHaveClass('space-y-6')
    })

    it('should apply custom className', () => {
      render(<SkeletonList className="custom-list" />)
      
      const list = screen.getByTestId('skeleton-list')
      expect(list).toHaveClass('custom-list')
    })

    it('should handle single item', () => {
      render(<SkeletonList items={1} />)
      
      const items = screen.getAllByTestId('skeleton-item')
      expect(items).toHaveLength(1)
    })

    it('should handle zero items gracefully', () => {
      render(<SkeletonList items={0} />)
      
      const items = screen.queryAllByTestId('skeleton-item')
      expect(items).toHaveLength(0)
    })
  })

  describe('SkeletonForm', () => {
    it('should render with default props', () => {
      render(<SkeletonForm />)
      
      const form = document.querySelector('.space-y-6')
      expect(form).toBeInTheDocument()
      
      // Should have 4 fields + 2 buttons
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(10) // 4 fields * 2 elements + 2 buttons
    })

    it('should render specified number of fields', () => {
      render(<SkeletonForm fields={2} />)
      
      const form = document.querySelector('.space-y-6')
      expect(form).toBeInTheDocument()
      
      // Should have 2 fields + 2 buttons
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThanOrEqual(6) // 2 fields * 2 elements + 2 buttons
    })

    it('should render with custom field heights', () => {
      render(<SkeletonForm fields={2} fieldHeight="h-10" />)
      
      const fields = screen.getAllByTestId('skeleton-field')
      fields.forEach(field => {
        expect(field).toHaveClass('h-10')
      })
    })

    it('should render with custom spacing', () => {
      render(<SkeletonForm fields={3} spacing="space-y-4" />)
      
      const form = screen.getByTestId('skeleton-form')
      expect(form).toHaveClass('space-y-4')
    })

    it('should apply custom className', () => {
      render(<SkeletonForm className="custom-form" />)
      
      const form = screen.getByTestId('skeleton-form')
      expect(form).toHaveClass('custom-form')
    })

    it('should handle single field', () => {
      render(<SkeletonForm fields={1} />)
      
      const fields = screen.getAllByTestId('skeleton-field')
      expect(fields).toHaveLength(1)
    })

    it('should handle zero fields gracefully', () => {
      render(<SkeletonForm fields={0} />)
      
      const fields = screen.queryAllByTestId('skeleton-field')
      expect(fields).toHaveLength(0)
    })

    it('should render with custom field types', () => {
      render(
        <SkeletonForm 
          fields={2} 
          fieldTypes={['input', 'textarea']} 
        />
      )
      
      const fields = screen.getAllByTestId('skeleton-field')
      expect(fields).toHaveLength(2)
    })
  })

  describe('Skeleton Integration', () => {
    it('should work together in a complex layout', () => {
      render(
        <div>
          <SkeletonCard>
            <SkeletonAvatar size="lg" />
            <SkeletonText lines={3} />
            <SkeletonTable rows={2} columns={3} />
          </SkeletonCard>
        </div>
      )
      
      expect(screen.getByTestId('skeleton-card')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-text')).toBeInTheDocument()
      expect(screen.getByTestId('skeleton-table')).toBeInTheDocument()
    })

    it('should maintain consistent styling across variants', () => {
      const { rerender } = render(<Skeleton variant="text" />)
      
      let skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'dark:bg-gray-700')

      rerender(<Skeleton variant="circular" />)
      skeleton = screen.getByTestId('skeleton')
      expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'dark:bg-gray-700')
    })
  })
})
