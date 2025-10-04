import { BalboaVerificationPopup } from "./BalboaVerificationPopup";

interface VoiceVerificationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	email: string;
	question?: string;
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
	question,
	config,
}: VoiceVerificationDialogProps) {
	return (
		<BalboaVerificationPopup
			open={isOpen}
			onClose={onClose}
			onVerified={onSuccess}
			email={email}
			question={question}
			config={config}
		/>
	);
}
