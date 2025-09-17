import React from 'react';
import { X, Instagram } from 'lucide-react';

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
  onPublicToCommmunity: () => void;
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
  return (
    <div className="fixed inset-0 z-50">
      {/* Background with blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800)`,
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-16">
          <div className="w-12 h-12" /> {/* Spacer */}
          <h1 className="text-3xl font-bold text-black">Share Song</h1>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-gray-400/60 backdrop-blur-sm rounded-2xl flex items-center justify-center"
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
                  src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {/* Song Info */}
                    <h3 className="text-white text-xl font-bold mb-2">
                      Generated music content
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      user prompt summary
                    </p>
                    
                    {/* Creator Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">Y</span>
                      </div>
                      <span className="text-white text-lg font-medium">You</span>
                    </div>
                    
                    {/* Made with Indara Badge */}
                    <div className="inline-block bg-white/25 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-white text-sm font-medium">Made with Indara!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-6 pb-12 bg-transparent">
          <div className="flex items-center justify-center gap-4">
            {/* Public to Community */}
            <button
              onClick={onPublicToCommmunity}
              className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl py-4 px-4 flex items-center justify-center shadow-lg border border-gray-200"
            >
              <span className="text-black font-semibold text-sm">Public to Community</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={onCopyLink}
              className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl py-4 px-4 flex items-center justify-center shadow-lg border border-gray-200"
            >
              <span className="text-black font-semibold text-sm">Copy Link</span>
            </button>

            {/* Instagram */}
            <button
              onClick={onShareToInstagram}
              className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Instagram className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareSongScreen;
