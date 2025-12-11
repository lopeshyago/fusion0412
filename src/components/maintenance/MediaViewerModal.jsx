import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const isLikelyImage = (url = "") => {
  const hasImageExt = url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i);
  const isUploadPath = url.includes('/uploads/'); // arquivos no backend podem vir sem extensão
  return Boolean(hasImageExt || isUploadPath);
};

const isLikelyVideo = (url = "") => {
  return Boolean(url.match(/\.(mp4|webm|ogg|mov)$/i));
};

export default function MediaViewerModal({ isOpen, onClose, mediaUrl }) {
  if (!isOpen || !mediaUrl) return null;

  const isImage = isLikelyImage(mediaUrl);
  const isVideo = isLikelyVideo(mediaUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-2 bg-gray-900/90 border-gray-700 text-white">
        <DialogHeader className="p-4">
          <DialogTitle>Visualizador de Mídia</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center h-[75vh]">
          {isImage ? (
            <img src={mediaUrl} alt="Mídia Anexada" className="max-w-full max-h-full object-contain rounded-lg" />
          ) : isVideo ? (
            <video src={mediaUrl} controls autoPlay className="max-w-full max-h-full object-contain rounded-lg">
              Seu navegador não suporta a tag de vídeo.
            </video>
          ) : (
            <div className="p-8 text-center">
              <p>Formato de mídia não suportado para visualização.</p>
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mt-2 inline-block">
                Abrir em nova aba
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
