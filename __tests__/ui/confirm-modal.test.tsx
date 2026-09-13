import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '@/components/ui/confirm-modal';

describe('ConfirmModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        title: 'Confirm Action',
        message: 'Are you sure?',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders when open', () => {
        render(<ConfirmModal {...defaultProps} />);
        expect(screen.getByText('Confirm Action')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<ConfirmModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });

    it('calls onConfirm and onClose when confirm button clicked', () => {
        render(<ConfirmModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Confirm'));
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button clicked', () => {
        render(<ConfirmModal {...defaultProps} />);
        fireEvent.click(screen.getByText('Cancel'));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop clicked', () => {
        const { container } = render(<ConfirmModal {...defaultProps} />);
        const backdrop = container.querySelector('.bg-black\\/50');
        if (backdrop) fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('shows custom button text', () => {
        render(
            <ConfirmModal
                {...defaultProps}
                confirmText="Delete"
                cancelText="Keep"
            />
        );
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(screen.getByText('Keep')).toBeInTheDocument();
    });

    it('applies danger type styling', () => {
        render(<ConfirmModal {...defaultProps} type="danger" />);
        const confirmButton = screen.getByText('Confirm');
        expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('applies warning type styling', () => {
        render(<ConfirmModal {...defaultProps} type="warning" />);
        const confirmButton = screen.getByText('Confirm');
        expect(confirmButton).toHaveClass('bg-orange-600');
    });

    it('applies info type styling', () => {
        render(<ConfirmModal {...defaultProps} type="info" />);
        const confirmButton = screen.getByText('Confirm');
        expect(confirmButton).toHaveClass('bg-blue-600');
    });
});
