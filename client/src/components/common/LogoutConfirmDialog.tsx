import { ConfirmDialog } from './ConfirmDialog';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmDialog({ isOpen, onClose, onConfirm }: LogoutConfirmDialogProps) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Log out"
      message="Are you sure you want to log out of your account?"
      confirmLabel="Log out"
      variant="danger"
    />
  );
}
