import { BalboaVerificationPopup } from "./BalboaVerificationPopup";

interface VoiceVerificationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	email: string;
	config?: {
		apiKey?: string;
		agentId?: string;
	};
}

export function VoiceVerificationDialog({
	isOpen,
	onClose,
	onSuccess,
	email,
	config,
}: VoiceVerificationDialogProps) {
	return (
		<BalboaVerificationPopup
			open={isOpen}
			onClose={onClose}
			onVerified={onSuccess}
			secretPhrase="Balboa at sunset"
			config={config}
		/>
	);
}
