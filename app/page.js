'use client';

import { useState, useEffect } from 'react';
import ModelSelector from './components/ModelSelector';
import PromptOptions from './components/PromptOptions';
import Gallery from './components/Gallery';
import LoadingSpinner from './components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [options, setOptions] = useState({
    num_outputs: 1,
    aspect_ratio: '1:1',
    output_format: 'webp',
    output_quality: 80,
    safety_tolerance: 2,
    prompt_upsampling: true,
    go_fast: true,
    guidance: 3.5,
    megapixels: "1",
    prompt_strength: 0.8,
    num_inference_steps: 28,
    numImages: 1
  });
  
  // Estado para armazenar as previsões
  const [predictions, setPredictions] = useState([]);
  
  // Estado para indicar se está carregando
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para armazenar erro
  const [error, setError] = useState(null);

  // Carregar previsões existentes ao iniciar
  useEffect(() => {
    const loadPredictions = async () => {
      try {
        // Primeiro, verificar se há previsões no localStorage
        const savedPredictions = localStorage.getItem('predictions');
        let localPredictions = [];
        
        if (savedPredictions) {
          try {
            localPredictions = JSON.parse(savedPredictions);
            setPredictions(localPredictions);
          } catch (e) {
            console.error('Erro ao parsear previsões do localStorage:', e);
            // Se houver erro no parsing, limpar o localStorage
            localStorage.removeItem('predictions');
          }
        }
        
        // Depois, buscar da API para atualizar
        const response = await fetch('/api/predictions');
        if (response.ok) {
          const apiPredictions = await response.json();
          
          if (apiPredictions && apiPredictions.length > 0) {
            // Mesclar previsões da API com as do localStorage
            // Usar um Map para garantir que não haja duplicatas por ID
            const predictionsMap = new Map();
            
            // Primeiro adicionar as previsões da API
            apiPredictions.forEach(prediction => {
              predictionsMap.set(prediction.id, prediction);
            });
            
            // Depois adicionar as previsões do localStorage que não estão na API
            localPredictions.forEach(prediction => {
              if (!predictionsMap.has(prediction.id)) {
                predictionsMap.set(prediction.id, prediction);
              }
            });
            
            // Converter o Map de volta para array
            const mergedPredictions = Array.from(predictionsMap.values());
            
            // Salvar no localStorage para persistência
            localStorage.setItem('predictions', JSON.stringify(mergedPredictions));
            setPredictions(mergedPredictions);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar previsões:', err);
      }
    };
    
    loadPredictions();
  }, []);
  
  // Configurar intervalo para atualizar o status das previsões
  useEffect(() => {
    const interval = setInterval(updatePredictionStatus, 1000);
    return () => clearInterval(interval);
  }, [predictions]);
  
  // Função para atualizar o status das previsões
  const updatePredictionStatus = async () => {
    const updatingPredictions = predictions.filter(
      p => p.status === 'starting' || p.status === 'processing'
    );
    
    if (updatingPredictions.length === 0) return;
    
    try {
      const updatedPredictions = await Promise.all(
        updatingPredictions.map(async (prediction) => {
          try {
            const response = await fetch(`/api/predictions/${prediction.id}`);
            if (!response.ok) {
              console.warn(`Erro ao atualizar previsão ${prediction.id}:`, response.status);
              return prediction;
            }
            const updatedPrediction = await response.json();
            return updatedPrediction;
          } catch (error) {
            console.error(`Erro ao atualizar previsão ${prediction.id}:`, error);
            return prediction;
          }
        })
      );
      
      const newPredictions = predictions.map(prediction => {
        const updated = updatedPredictions.find(p => p.id === prediction.id);
        return updated || prediction;
      });
      
      setPredictions(newPredictions);
      
      // Atualizar o localStorage sempre que as previsões forem atualizadas
      localStorage.setItem('predictions', JSON.stringify(newPredictions));
    } catch (error) {
      console.error('Erro ao atualizar status das previsões:', error);
    }
  };
  
  // Função para gerar imagem
  const generateImage = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Por favor, insira um prompt.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          ...options
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao gerar imagem');
      }
      
      const prediction = await response.json();
      const newPredictions = [prediction, ...predictions];
      setPredictions(newPredictions);
      
      // Salvar no localStorage
      localStorage.setItem('predictions', JSON.stringify(newPredictions));
      
    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para limpar o histórico de previsões
  const clearPredictions = () => {
    setPredictions([]);
    localStorage.removeItem('predictions');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-10 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Gerador de Imagens com IA
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Crie imagens incríveis usando modelos de IA avançados. Basta digitar uma descrição e deixar a IA fazer a mágica.
          </p>
        </header>
        
        <Card className="mb-10 border shadow-md">
          <CardContent className="p-6">
            <form onSubmit={generateImage} className="space-y-6">
              <div>
                <ModelSelector 
                  selectedModel={selectedModel} 
                  setSelectedModel={setSelectedModel} 
                />
              </div>
              
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                  Descreva a imagem que você deseja criar
                </label>
                <Textarea
                  id="prompt"
                  placeholder="Uma paisagem futurista com arranha-céus flutuantes e carros voadores..."
                  className="h-24"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Opções Básicas</TabsTrigger>
                  <TabsTrigger value="advanced">Opções Avançadas</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <PromptOptions 
                    options={options} 
                    setOptions={setOptions} 
                    selectedModel={selectedModel}
                    type="basic"
                  />
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4">
                  <PromptOptions 
                    options={options} 
                    setOptions={setOptions} 
                    selectedModel={selectedModel}
                    type="advanced"
                  />
                </TabsContent>
              </Tabs>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? <LoadingSpinner /> : 'Gerar Imagem'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Gallery 
          predictions={predictions} 
          isLoading={isLoading}
          selectedModel={selectedModel}
        />
        
        {predictions.length > 0 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={clearPredictions}
              className="text-muted-foreground"
            >
              Limpar histórico
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
