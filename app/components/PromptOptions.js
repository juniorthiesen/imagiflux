'use client';

import { useState } from 'react';
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input.jsx";
import { Checkbox } from "../../components/ui/checkbox";

// Lista de aspect ratios válidos com descrições
const ASPECT_RATIOS = [
  { value: "1:1", label: "Quadrada (1:1)" },
  { value: "16:9", label: "Paisagem (16:9)" },
  { value: "21:9", label: "Ultra-wide (21:9)" },
  { value: "3:2", label: "Paisagem (3:2)" },
  { value: "2:3", label: "Retrato (2:3)" },
  { value: "4:5", label: "Retrato (4:5)" },
  { value: "5:4", label: "Paisagem (5:4)" },
  { value: "3:4", label: "Retrato (3:4)" },
  { value: "4:3", label: "Paisagem (4:3)" },
  { value: "9:16", label: "Retrato (9:16)" },
  { value: "9:21", label: "Ultra-tall (9:21)" }
];

export default function PromptOptions({ options, setOptions, selectedModel, type = 'basic' }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOptions({ ...options, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setOptions({ ...options, [name]: value });
  };

  const handleSliderChange = (name, value) => {
    setOptions({ ...options, [name]: Array.isArray(value) ? value[0] : value });
  };

  const handleSwitchChange = (name, checked) => {
    setOptions({ ...options, [name]: checked });
  };

  // Renderizar apenas opções básicas
  if (type === 'basic') {
    return (
      <div className="space-y-4">
        {/* Proporção da imagem (comum a todos os modelos) */}
        <div>
          <Label htmlFor="aspect_ratio" className="text-sm font-medium">
            Proporção da Imagem
          </Label>
          <Select
            value={options.aspect_ratio}
            onValueChange={(value) => handleSelectChange('aspect_ratio', value)}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Selecione a proporção" />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value}>{ratio.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Número de imagens (para modelos que suportam) */}
        {(selectedModel === 'flux-schnell' || selectedModel === 'flux-dev') && (
          <div>
            <Label htmlFor="num_outputs" className="text-sm font-medium">
              Número de Imagens
            </Label>
            <Select
              value={options.num_outputs.toString()}
              onValueChange={(value) => handleSelectChange('num_outputs', parseInt(value))}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Número de imagens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 imagem</SelectItem>
                {selectedModel === 'flux-schnell' && (
                  <>
                    <SelectItem value="2">2 imagens</SelectItem>
                    <SelectItem value="3">3 imagens</SelectItem>
                    <SelectItem value="4">4 imagens</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Formato de saída (comum a todos os modelos) */}
        <div>
          <Label htmlFor="output_format" className="text-sm font-medium">
            Formato de Saída
          </Label>
          <Select
            value={options.output_format}
            onValueChange={(value) => handleSelectChange('output_format', value)}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Selecione o formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="webp">WebP (melhor qualidade/tamanho)</SelectItem>
              <SelectItem value="png">PNG (sem perda)</SelectItem>
              <SelectItem value="jpg">JPG (menor tamanho)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Renderizar opções avançadas
  return (
    <div className="space-y-6">
      {/* Opções específicas para flux-1.1-pro */}
      {selectedModel === 'flux-1.1-pro' && (
        <>
          <div>
            <Label className="text-sm font-medium">Qualidade de Saída</Label>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Menor</span>
              <Slider
                className="mx-4 flex-1"
                value={[options.output_quality]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) => handleSliderChange('output_quality', value)}
              />
              <span className="text-xs text-muted-foreground">Maior</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor atual: {options.output_quality}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Tolerância de Segurança</Label>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Estrito</span>
              <Slider
                className="mx-4 flex-1"
                value={[options.safety_tolerance]}
                min={0}
                max={3}
                step={1}
                onValueChange={(value) => handleSliderChange('safety_tolerance', value)}
              />
              <span className="text-xs text-muted-foreground">Permissivo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor atual: {options.safety_tolerance}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="prompt_upsampling"
              checked={options.prompt_upsampling}
              onCheckedChange={(checked) => handleSwitchChange('prompt_upsampling', checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="prompt_upsampling" className="text-sm font-medium">
                Melhoria de Prompt
              </Label>
              <p className="text-xs text-muted-foreground">
                Melhora automaticamente o prompt para resultados mais detalhados
              </p>
            </div>
          </div>
        </>
      )}

      {/* Opções específicas para flux-dev */}
      {selectedModel === 'flux-dev' && (
        <>
          <div>
            <Label className="text-sm font-medium">Orientação (Guidance)</Label>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Menor</span>
              <Slider
                className="mx-4 flex-1"
                value={[options.guidance]}
                min={1}
                max={10}
                step={0.1}
                onValueChange={(value) => handleSliderChange('guidance', value)}
              />
              <span className="text-xs text-muted-foreground">Maior</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor atual: {options.guidance}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Força do Prompt</Label>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Menor</span>
              <Slider
                className="mx-4 flex-1"
                value={[options.prompt_strength]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={(value) => handleSliderChange('prompt_strength', value)}
              />
              <span className="text-xs text-muted-foreground">Maior</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor atual: {options.prompt_strength.toFixed(2)}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Passos de Inferência</Label>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Menos</span>
              <Slider
                className="mx-4 flex-1"
                value={[options.num_inference_steps]}
                min={1}
                max={50}
                step={1}
                onValueChange={(value) => handleSliderChange('num_inference_steps', value)}
              />
              <span className="text-xs text-muted-foreground">Mais</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor atual: {options.num_inference_steps}
            </p>
          </div>

          <div>
            <Label htmlFor="megapixels" className="text-sm font-medium">
              Megapixels
            </Label>
            <Select
              value={options.megapixels}
              onValueChange={(value) => handleSelectChange('megapixels', value)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Selecione a resolução" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 MP (padrão)</SelectItem>
                <SelectItem value="2">2 MP (HD)</SelectItem>
                <SelectItem value="4">4 MP (Ultra HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="go_fast"
              checked={options.go_fast}
              onCheckedChange={(checked) => handleSwitchChange('go_fast', checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="go_fast" className="text-sm font-medium">
                Modo Rápido
              </Label>
              <p className="text-xs text-muted-foreground">
                Gera imagens mais rapidamente com qualidade levemente reduzida
              </p>
            </div>
          </div>
        </>
      )}

      {/* Opções avançadas comuns a todos os modelos */}
      <div>
        <Label className="text-sm font-medium">Qualidade de Saída</Label>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">Menor</span>
          <Slider
            className="mx-4 flex-1"
            value={[options.output_quality]}
            min={1}
            max={100}
            step={1}
            onValueChange={(value) => handleSliderChange('output_quality', value)}
          />
          <span className="text-xs text-muted-foreground">Maior</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Valor atual: {options.output_quality}
        </p>
      </div>
    </div>
  );
}
