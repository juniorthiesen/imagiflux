'use client';

import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";

export default function ModelSelector({ selectedModel, setSelectedModel }) {
  const models = [
    {
      id: 'flux-schnell',
      name: 'Flux Schnell',
      description: 'Geração rápida de imagens com até 4 variações',
      gradient: 'from-blue-500 to-indigo-500',
      features: ['Rápido', 'Múltiplas variações', 'Bom para testes']
    },
    {
      id: 'flux-1.1-pro',
      name: 'Flux 1.1 Pro',
      description: 'Alta qualidade e detalhes, ideal para imagens finais',
      gradient: 'from-purple-500 to-pink-500',
      features: ['Alta qualidade', 'Detalhes refinados', 'Realismo']
    },
    {
      id: 'flux-dev',
      name: 'Flux Dev',
      description: 'Modelo experimental com controles avançados',
      gradient: 'from-green-500 to-teal-500',
      features: ['Experimental', 'Controles avançados', 'Personalização']
    }
  ];

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium mb-2">
          Selecione o Modelo
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card 
              key={model.id}
              className={cn(
                "cursor-pointer transition-all duration-200 overflow-hidden border",
                selectedModel === model.id 
                  ? "ring-2 ring-primary shadow-md" 
                  : "hover:shadow-md"
              )}
              onClick={() => setSelectedModel(model.id)}
            >
              <div 
                className={cn(
                  "h-2 w-full bg-gradient-to-r", 
                  model.gradient
                )}
              />
              <CardContent className="p-4">
                <h3 className="font-medium">{model.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  {model.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {model.features.map((feature) => (
                    <span 
                      key={feature} 
                      className="text-xs bg-muted px-2 py-0.5 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
