import { useMemo } from "react";

export function PasswordStrength({ password }: { password?: string }) {
	const strength = useMemo(() => {
		if (!password) return 0;
		let s = 0;
		if (password.length >= 8) s++;
		if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
		if (/[0-9]/.test(password)) s++;
		if (/[^A-Za-z0-9]/.test(password)) s++;
		return s;
	}, [password]);

	if (!password) return null;

	const config = [
		{ label: "Sangat Lemah", text: "text-red-400" },
		{ label: "Lemah", text: "text-amber-400" },
		{ label: "Sedang", text: "text-emerald-400" },
		{ label: "Kuat", text: "text-emerald-500" },
	];

	const current = config[Math.max(0, strength - 1)];

	return (
		<div className="mt-2 space-y-1">
			<div className="flex gap-1">
				{[1, 2, 3, 4].map((n) => (
					<div
						key={n}
						className={`h-1 flex-1 rounded-full transition-all ${n <= strength
							? strength === 1 ? "bg-red-400"
								: strength === 2 ? "bg-amber-400"
									: strength === 3 ? "bg-emerald-400"
										: "bg-emerald-500"
							: "bg-gray-200"
							}`}
					/>
				))}
			</div>
			<p className={`text-[11px] font-medium ${current.text}`}>
				Kekuatan Password: {current.label}
			</p>
		</div>
	);
}