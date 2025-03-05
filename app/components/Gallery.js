'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import LoadingSpinner from './LoadingSpinner';
import { cn } from '../../lib/utils';

export default function Gallery({ predictions, isLoading, selectedModel }) {
  const [expandedImage, setExpandedImage] = useState(null);
  const [hovered, setHovered] = useState(null);

  // Filtrar previsões concluídas
  const completedPredictions = predictions.filter(
    prediction => prediction.status === 'succeeded'
  );

  // Filtrar previsões em andamento
  const pendingPredictions = predictions.filter(
    prediction => prediction.status === 'starting' || prediction.status === 'processing'
  );

  // Função para baixar imagem
  const downloadImage = (imageUrl, prompt) => {
    // Extrair o nome do arquivo da URL ou usar o prompt como nome
    const fileName = prompt
      ? `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
      : 'generated-image.png';

    saveAs(imageUrl, fileName);
  };

  // Função para expandir imagem
  const handleImageClick = (prediction) => {
    setExpandedImage(prediction);
  };

  // Função para fechar imagem expandida
  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  // Função para obter a URL da imagem com segurança
  const getImageUrl = (prediction) => {
    if (!prediction || !prediction.output) return null;
    
    // Verificar se output é um array e tem pelo menos um item
    if (Array.isArray(prediction.output) && prediction.output.length > 0) {
      return prediction.output[0];
    }
    
    // Se não for um array, pode ser uma string direta
    if (typeof prediction.output === 'string') {
      return prediction.output;
    }
    
    // Se for um objeto (como no caso do flux-1.1-pro), tente acessar a propriedade correta
    if (typeof prediction.output === 'object') {
      // Tente diferentes propriedades que podem conter a URL da imagem
      return prediction.output.image || 
             prediction.output.images?.[0] || 
             Object.values(prediction.output)[0];
    }
    
    return null;
  };

  // Renderizar mensagem quando não há imagens
  if (completedPredictions.length === 0 && pendingPredictions.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Sua galeria está vazia</h2>
        <p className="text-muted-foreground mb-6">
          Crie sua primeira imagem usando o formulário acima
        </p>
        <div className="w-24 h-24 mx-auto opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Suas Imagens</h2>

        {/* Imagens em processamento */}
        {(pendingPredictions.length > 0 || isLoading) && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Processando</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPredictions.map((prediction) => (
                <Card key={prediction.id} className="overflow-hidden border shadow-md bg-muted/30">
                  <div className="aspect-square relative flex items-center justify-center bg-muted/50">
                    <LoadingSpinner />
                  </div>
                  <CardFooter className="p-4 bg-card border-t">
                    <div className="w-full">
                      <p className="text-sm line-clamp-1 mb-1 font-medium">
                        {prediction.prompt || "Gerando imagem..."}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {prediction.status === 'starting' ? 'Iniciando...' : 'Processando...'}
                        </span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {prediction.model || selectedModel}
                        </span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Imagens concluídas */}
        {completedPredictions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Concluídas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedPredictions.map((prediction, index) => {
                const imageUrl = getImageUrl(prediction);
                
                if (!imageUrl) {
                  console.warn(`Imagem não encontrada para a previsão: ${prediction.id}`, prediction);
                  return null;
                }
                
                return (
                  <Card 
                    key={prediction.id} 
                    className={cn(
                      "overflow-hidden border shadow-md cursor-pointer transition-all duration-200",
                      hovered === index ? "scale-[1.02] shadow-lg" : ""
                    )}
                    onClick={() => handleImageClick(prediction)}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="aspect-square relative">
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 transition-opacity",
                        hovered === index ? "opacity-100" : "opacity-0"
                      )}>
                        <p className="text-white font-medium line-clamp-1 mb-2 text-shadow">
                          {prediction.prompt}
                        </p>
                        <div className="flex justify-between items-center">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-white/20 border-white/40 text-white hover:bg-white/30 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(
                                imageUrl,
                                prediction.prompt
                              );
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Baixar
                          </Button>
                          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                            {prediction.model || selectedModel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}
      </div>

      {/* Modal de imagem expandida */}
      {expandedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={handleCloseExpandedImage}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white"
              onClick={handleCloseExpandedImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
            
            <div className="bg-card rounded-lg overflow-hidden shadow-2xl">
              <div className="relative aspect-square">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${getImageUrl(expandedImage)})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              </div>
              
              <div className="p-4 bg-card border-t">
                <p className="text-lg font-medium mb-2">{expandedImage.prompt}</p>
                <div className="flex justify-between items-center">
                  <Button 
                    onClick={() => downloadImage(getImageUrl(expandedImage), expandedImage.prompt)}
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Baixar Imagem
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Modelo: <span className="font-medium">{expandedImage.model || selectedModel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
