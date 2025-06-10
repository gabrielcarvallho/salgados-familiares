"use client";

import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Address as AddressType } from "@/types/Customer";
import { Building2, Home, MapPin, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cleanCEP } from "@/lib/utils";
import { useViaCEP } from "@/hooks/useCustomer";
import { toast } from "sonner";

export function AddressForm({
  onSave,
  onCancel,
}: {
  onSave: (address: AddressType) => void;
  onCancel: () => void;
}) {
  // Estado local para os campos
  const [formData, setFormData] = useState<AddressType>({
    cep: "",
    street_name: "",
    number: "",
    observation: "",
    district: "",
    city: "",
    state: "",
    description: "Novo endereço",
  });
  const prevCepRef = useRef<string>("");

  // Função personalizada para decidir quando buscar o CEP
  const shouldFetch = (cep: string): string => {
    const cepLength = cep.length;
    if (cepLength === 8) return cep;
    return "";
  };

  const cep = shouldFetch(formData.cep);
  const { address: fetchedAddress, isLoading, isError } = useViaCEP(
    cleanCEP(cep)
  );

  // Auto-preenche apenas campos vazios
  useEffect(() => {
    if (
      fetchedAddress &&
      typeof fetchedAddress !== "string" &&
      fetchedAddress.logradouro
    ) {
      setFormData(prev => ({
        ...prev,
        street_name: prev.street_name || fetchedAddress.logradouro,
        district:    prev.district    || fetchedAddress.bairro,
        city:        prev.city        || fetchedAddress.localidade,
        state:       prev.state       || fetchedAddress.uf,
      }));
      toast.success("Endereço preenchido automaticamente!", { duration: 2000 });
    }
  }, [fetchedAddress]);

  // Captura mudanças nos inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Se for mudança de CEP, limpa todos os outros campos
    if (name === "cep") {
      if (prevCepRef.current !== value) {
        setFormData({
          cep: value,
          street_name: "",
          number: "",
          observation: "",
          district: "",
          city: "",
          state: "",
          description: "Novo endereço",
        });
        prevCepRef.current = value;
        return;
      }
    }

    // Para outros campos, apenas atualiza
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Salvar
  const handleSaveClick = () => {
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Novo Endereço de Entrega</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CEP */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#FF8F3F]" />
            <FormLabel className="text-gray-700">CEP*</FormLabel>
          </div>
          <Input
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            placeholder="89000-000"
            className="border-gray-300 focus:border-[#FF8F3F] focus:ring-[#FF8F3F]"
            required
          />
        </div>

        {/* Rua */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-[#FF8F3F]" />
            <FormLabel className="text-gray-700">Rua*</FormLabel>
          </div>
          <Input
            name="street_name"
            value={formData.street_name}
            onChange={handleChange}
            placeholder="Rua Dona Francisca"
            className="border-gray-300 focus:border-[#FF8F3F] focus:ring-[#FF8F3F]"
            required
          />
        </div>

        {/* Número */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[#FF8F3F] font-medium">#</span>
            <FormLabel className="text-gray-700">Número*</FormLabel>
          </div>
          <Input
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="5130"
            className="border-gray-300 focus:border-[#FF8F3F] focus:ring-[#FF8F3F]"
            required
          />
        </div>

        {/* Bairro */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#FF8F3F]" />
            <FormLabel className="text-gray-700">Bairro*</FormLabel>
          </div>
          <Input
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Santo Antônio"
            className="border-gray-300 focus:border-[#FF8F3F] focus:ring-[#FF8F3F]"
            required
          />
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#FF8F3F]" />
            <FormLabel className="text-gray-700">Cidade*</FormLabel>
          </div>
          <Input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Joinville"
            className="border-gray-300 focus:border-[#FF8F3F] focus:ring-[#FF8F3F]"
            required
          />
        </div>

        {/* UF */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#FF8F3F]" />
            <FormLabel className="text-gray-700">UF*</FormLabel>
          </div>
          <Input
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="SC"
            className="border-gray-300 focus:border-[#FF8F3F] focus:ring-[#FF8F3F]"
            required
          />
        </div>

        {/* Observação */}
        <div className="col-span-2 space-y-2">
          <FormLabel className="text-gray-700">Observação</FormLabel>
          <Textarea
            name="observation"
            value={formData.observation || ""}
            onChange={handleChange}
            placeholder="APTO 300"
            className="border-gray-300 focus:border-[#FF8F3F] focus:ring-[#FF8F3F]"
          />
        </div>

        {/* Descrição */}
        <div className="col-span-2 space-y-2">
          <FormLabel className="text-gray-700">Descrição</FormLabel>
          <Input
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Trabalho"
            className="border-gray-300 focus:border-[#FF8F3F] focus:ring-[#FF8F3F]"
          />
        </div>

        {/* Botões */}
        <div className="col-span-2 flex justify-end space-x-3 mt-4">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant={"outline"} type="button" onClick={handleSaveClick} className="bg-[#FF8F3F] text-white">Salvar Endereço</Button>
        </div>
      </div>
    </motion.div>
  );
}