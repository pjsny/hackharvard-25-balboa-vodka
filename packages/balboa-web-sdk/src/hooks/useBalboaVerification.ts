"use client";

import { useCallback, useState } from "react";
import { useBalboa } from "../hooks";
import type {
	UseBalboaVerificationReturn,
	VerificationOptions,
} from "../types";

interface UseBalboaVerificationOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export function useBalboaVerification(
	options?: UseBalboaVerificationOptions,
): UseBalboaVerificationReturn {
	const [isOpen, setIsOpen] = useState(false);
	const [currentOptions, setCurrentOptions] =
		useState<VerificationOptions | null>(null);
	const { verifyWithBalboa, isLoading, result, error } = useBalboa();

	const startVerification = useCallback(
		(verificationOptions: VerificationOptions) => {
			setCurrentOptions(verificationOptions);
			setIsOpen(true);
		},
		[],
	);

	const handleSuccess = useCallback(() => {
		setIsOpen(false);
		setCurrentOptions(null);
		options?.onSuccess?.();
	}, [options]);

	const handleClose = useCallback(() => {
		setIsOpen(false);
		setCurrentOptions(null);
	}, []);

	return {
		startVerification,
		isLoading,
		result,
		error,
		isOpen,
		currentOptions,
		handleSuccess,
		handleClose,
		verifyWithBalboa,
	};
}
