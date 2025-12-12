import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import { createPageUrl } from '@/utils';
import { localApi } from "@/api/localApi";

const logoUrl = "/fusionlogo.png";

export default function InstructorRegistration() {
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhone = (value) => {
    const digits = (value || "").replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    const part1 = digits.slice(0, 2);
    const part2 = digits.slice(2, 7);
    const part3 = digits.slice(7, 11);
    const middle = part2 ? ` ${part2}` : '';
    const end = part3 ? `-${part3}` : '';
    return `(${part1}${part1.length === 2 ? ')' : ''}${middle}${end}`.trim();
  };

  const formatCpf = (value) => {
    const digits = (value || "").replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatCep = (value) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  const fetchAddressByCep = async (value) => {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length !== 8) return;
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await resp.json();
      if (data && !data.erro) {
        setAddress(data.logradouro || "");
        setNeighborhood(data.bairro || "");
      }
    } catch (e) {
      // silencioso
    }
  };

  const handleBackToMenu = () => {
    window.location.href = createPageUrl('Index');
  };

  const handleRegister = async () => {
    const cpfDigits = cpf.replace(/\D/g, '');
    if (!inviteCode.trim() || !email || !password || !fullName || !dateOfBirth || !cpfDigits || !phone || !emergencyPhone || !cep || !address || !neighborhood || !addressNumber) {
      setError("Preencha todos os campos.");
      return;
    }
    if (cpfDigits.length !== 11) {
      setError("CPF deve ter 11 digitos.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const phoneDigits = phone.replace(/\D/g, '');
      const emergencyPhoneDigits = emergencyPhone.replace(/\D/g, '');
      const res = await localApi.request("/register/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, invite_code: inviteCode.trim(), date_of_birth: dateOfBirth, cpf: cpfDigits, phone: phoneDigits, emergency_phone: emergencyPhoneDigits, cep: cep.replace(/\D/g, ''), address, address_number: addressNumber, neighborhood })
      });
      if (res?.token) {
        localApi.setToken(res.token);
      }
      window.location.href = createPageUrl("InstructorProfile");
    } catch (err) {
      console.error("Erro ao cadastrar instrutor:", err);
      setError("Falha ao cadastrar. Verifique codigo de convite e dados (CPF com 11 digitos).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <header className="bg-black text-white p-4 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Fusion Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-white">Cadastro de Instrutor</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBackToMenu} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Menu
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md shadow-2xl border-orange-200">
          <CardHeader className="text-center">
            <KeyRound className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <CardTitle className="text-2xl font-bold">Cadastro de Instrutor</CardTitle>
            <CardDescription>Informe seus dados e o codigo de convite.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 text-sm rounded-md p-3 text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="border-orange-200" />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                className="border-orange-200"
                maxLength={14}
                autoComplete="off"
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-orange-200" />
            </div>
            <div className="space-y-2">
              <Label>Telefone/WhatsApp</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="border-orange-200"
                autoComplete="tel"
                placeholder="(11) 90000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone de Emergencia</Label>
              <Input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(formatPhone(e.target.value))}
                className="border-orange-200"
                autoComplete="tel"
                placeholder="(11) 90000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                value={cep}
                onChange={(e) => setCep(formatCep(e.target.value))}
                onBlur={(e) => fetchAddressByCep(e.target.value)}
                className="border-orange-200"
                maxLength={9}
                placeholder="00000-000"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} className="border-orange-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Número</Label>
                <Input value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} className="border-orange-200" />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="border-orange-200" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="border-orange-200" />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-orange-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Codigo de Convite</Label>
              <Input id="inviteCode" placeholder="FUSION-INST-XXXX" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} className="border-orange-200 text-center tracking-widest" />
            </div>
            <Button onClick={handleRegister} disabled={isLoading} className="w-full bg-orange-500 hover:bg-orange-600">
              {isLoading ? "Cadastrando..." : "Cadastrar"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
