import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus } from 'lucide-react';
import { localApi } from '@/api/localApi';
import { useOptimizedNavigation } from "../components/common/NavigationHelper";
import { useLocation } from 'react-router-dom';

const logoUrl = "/fusionlogo.png";

export default function StudentRegistration() {
  const { navigateTo } = useOptimizedNavigation();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fromParam = params.get('from');
  const backTarget = fromParam === 'instructor' ? 'InstructorDashboard' : 'Index';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [condoCode, setCondoCode] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [cpf, setCpf] = useState('');
  const [block, setBlock] = useState('');
  const [apartment, setApartment] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorCrm, setDoctorCrm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
  const age = calculateAge(dateOfBirth);
  const isMinor = age !== null && age < 18;

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

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName || !condoCode || !dateOfBirth || !cpf || !phone || !emergencyPhone) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (isMinor && (!guardianName || !guardianContact || !doctorName || !doctorCrm)) {
      setError('Para menores de idade, preencha os dados do responsável e do médico.');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await localApi.request('/register/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName, 
          condo_code: condoCode,
          date_of_birth: dateOfBirth,
          phone: phone.replace(/\D/g, ''),
          emergency_phone: emergencyPhone.replace(/\D/g, ''),
          cpf,
          block,
          apartment,
          guardian_name: guardianName,
          guardian_contact: guardianContact,
          doctor_name: doctorName,
          doctor_crm: doctorCrm
        })
      });
      if (res?.token) {
        localApi.setToken(res.token);
      }
      navigateTo('StudentSetup', { replace: true });
    } catch (e) {
      setError(e.message || 'Falha no cadastro. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <header className="bg-black text-white p-4 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Fusion Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-white">Cadastro de Aluno</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateTo(backTarget)} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Menu
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md shadow-2xl border-orange-200">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <CardTitle className="text-2xl font-bold">Crie sua conta</CardTitle>
            <CardDescription>Vincule-se ao condomínio com seu código.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="bg-red-100 border border-red-200 text-red-700 text-sm rounded-md p-3 text-center mb-3">{error}</div>}
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1">
                <Label>Nome completo</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="border-orange-200" />
              </div>
              <div className="space-y-1">
                <Label>CPF</Label>
                <Input value={cpf} onChange={e => setCpf(e.target.value)} className="border-orange-200" />
              </div>
              <div className="space-y-1">
                <Label>Data de Nascimento</Label>
                <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="border-orange-200" />
              </div>
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border-orange-200" />
            </div>
              <div className="space-y-1">
                <Label>Telefone/WhatsApp</Label>
                <Input
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  className="border-orange-200"
                  autoComplete="tel"
                  placeholder="(11) 90000-0000"
                />
              </div>
              <div className="space-y-1">
                <Label>Telefone de Emergencia</Label>
                <Input
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(formatPhone(e.target.value))}
                  className="border-orange-200"
                  autoComplete="tel"
                  placeholder="(11) 90000-0000"
                />
              </div>
              <div className="space-y-1">
                <Label>Senha</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border-orange-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Bloco</Label>
                  <Input value={block} onChange={e => setBlock(e.target.value)} className="border-orange-200" />
                </div>
                <div className="space-y-1">
                  <Label>Apartamento</Label>
                  <Input value={apartment} onChange={e => setApartment(e.target.value)} className="border-orange-200" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Código do Condomínio</Label>
                <Input value={condoCode} onChange={e => setCondoCode(e.target.value.toUpperCase())} className="border-orange-200 tracking-widest" />
              </div>
              {isMinor && (
                <div className="space-y-3 rounded-lg border border-orange-200 p-3">
                  <p className="text-sm font-semibold text-orange-700">Dados do Responsável / Médico (obrigatório para menores)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Nome do Responsável</Label>
                      <Input value={guardianName} onChange={e => setGuardianName(e.target.value)} className="border-orange-200" />
                    </div>
                    <div className="space-y-1">
                      <Label>Contato do Responsável</Label>
                      <Input value={guardianContact} onChange={e => setGuardianContact(e.target.value)} className="border-orange-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Médico que liberou</Label>
                      <Input value={doctorName} onChange={e => setDoctorName(e.target.value)} className="border-orange-200" />
                    </div>
                    <div className="space-y-1">
                      <Label>CRM do Médico</Label>
                      <Input value={doctorCrm} onChange={e => setDoctorCrm(e.target.value)} className="border-orange-200" />
                    </div>
                  </div>
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
