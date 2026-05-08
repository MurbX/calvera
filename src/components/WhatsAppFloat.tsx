'use client'

type Props = {
  phone: string // digits only, e.g. "254723284994"
  message?: string
  className?: string
}

export function WhatsAppFloat({
  phone,
  message,
  className = 'fixed bottom-6 right-6 z-30',
}: Props) {
  const url = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Calvera on WhatsApp"
      className={`group inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1ebe5a] ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-5 w-5 fill-current"
        aria-hidden
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.41 1.95.957 2.78 1.04 1.59 2.18 2.84 3.79 3.834.69.43 2.005 1.348 2.81 1.348.317 0 .76-.215.96-.43.34-.358.62-.788.785-1.27.13-.376.13-.75.07-.9-.03-.07-.6-.36-.945-.5z" />
        <path d="M16 4C9.373 4 4 9.373 4 16c0 2.119.555 4.18 1.61 5.997L4 28l6.182-1.625A12 12 0 0 0 28 16c0-6.627-5.373-12-12-12zm0 22a9.95 9.95 0 0 1-5.07-1.382l-.363-.215-3.766.99 1.005-3.673-.236-.378A9.96 9.96 0 0 1 6 16c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
      </svg>
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  )
}
