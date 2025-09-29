import React, { useEffect, useRef } from 'react';
import { X, Instagram } from 'lucide-react';
import { getSmartThumbnail } from '../utils/thumbnailMatcher';

interface Song {
  id: string;
  title: string;
  description: string;
  tags: string;
  plays: number;
  likes: number;
  image: string;
  version: string;
  isPublic: boolean;
  createdAt: string;
  creator?: string;
  isLiked?: boolean;
  duration?: string;
}

interface ShareSongScreenProps {
  onClose: () => void;
  song: Song;
  onPublicToCommmunity: () => void; // keep spelling to match caller
  onCopyLink: () => void;
  onShareToInstagram: () => void;
}

const ShareSongScreen: React.FC<ShareSongScreenProps> = ({
  onClose,
  song,
  onPublicToCommmunity,
  onCopyLink,
  onShareToInstagram,
}) => {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Close on clicking the blurred backdrop (but not inner content)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  const coverImage =
    song.image ||
    getSmartThumbnail(
      song.title || 'Generated music content',
      song.description || '',
      song.tags || '',
      song.id
    );

  const bgImage =
    song.image ||
    getSmartThumbnail(
      song.title || 'Generated music content',
      song.description || '',
      song.tags || '',
      song.id
    );

  const title = song.title?.trim() || 'Generated music content';
  const desc = song.description?.trim() || 'user prompt summary';
  const creator = song.creator?.trim() || 'You';
  const creatorInitial = creator.charAt(0).toUpperCase();

  return (
    <div className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label="Share Song">
      {/* Background with blur effect */}
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-16">
          <div className="w-12 h-12" aria-hidden /> {/* Spacer to balance close button */}
          <h1 className="text-3xl font-bold text-black">Share Song</h1>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 bg-gray-400/60 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-gray-500/60 active:bg-gray-600/60 transition"
            aria-label="Close share panel"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Song Preview Card - Centered */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Song Image */}
              <div className="relative aspect-[4/5]">
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {/* Song Info */}
                    <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
                    <p className="text-white/90 text-sm mb-4 line-clamp-2">{desc}</p>

                    {/* Creator Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">{creatorInitial}</span>
                      </div>
                      <span className="text-white text-lg font-medium">{creator}</span>
                    </div>

                    {/* Made with Indara Badge */}
                    <div className="inline-block bg-white/25 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-white text-sm font-medium">Made with Indara</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions (mobile-friendly stacked on small screens) */}
              <div className="p-5">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {/* Public to Community */}
                  <button
                    type="button"
                    onClick={onPublicToCommmunity}
                    className="w-full sm:flex-1 bg-white/90 backdrop-blur-sm rounded-2xl py-3 px-4 shadow-lg border border-gray-200 hover:bg-white active:opacity-90 transition"
                    aria-label="Publish to community"
                  >
                    <span className="text-black font-semibold text-sm">Public to Community</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={onCopyLink}
                    className="w-full sm:flex-1 bg-white/90 backdrop-blur-sm rounded-2xl py-3 px-4 shadow-lg border border-gray-200 hover:bg-white active:opacity-90 transition"
                    aria-label="Copy shareable link"
                  >
                    <span className="text-black font-semibold text-sm">Copy Link</span>
                  </button>

                  {/* Instagram */}
                  <button
                    type="button"
                    onClick={onShareToInstagram}
                    className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg hover:opacity-90 active:opacity-80 transition"
                    aria-label="Share to Instagram"
                    title="Share to Instagram"
                  >
                    <Instagram className="w-8 h-8 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Optional: a small helper text */}
            <p className="text-center text-black/60 text-xs mt-4">
              Tip: Press <kbd className="px-1 py-0.5 bg-black/10 rounded">Esc</kbd> to close.
            </p>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="pb-6" />
      </div>
    </div>
  );
};

export default ShareSongScreen;
