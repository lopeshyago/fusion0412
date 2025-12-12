import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useOptimizedNavigation } from "../components/common/NavigationHelper";

export default function AdminProfile() {
  const { navigateTo } = useOptimizedNavigation();
  const [form, setForm] = useState({ full_name: '', phone: '', avatar_url: '', cpf: '', address: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

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

  useEffect(() => {
    (async () => {
      try {
        const { User } = await import('@/api/entities_new');
        const me = await User.me();
        const initial = {
          full_name: me?.full_name || '',
          phone: formatPhone(me?.phone || ''),
          avatar_url: me?.avatar_url || '',
          cpf: me?.cpf ? me.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : '',
          address: me?.address || '',
          email: me?.email || ''
        };
        setForm(initial);
        setAvatarPreview(initial.avatar_url || '');
      } catch (e) {
        setError('Falha ao carregar perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'cpf') {
      const cpfValue = value.replace(/\D/g, "");
      const formatted = cpfValue
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
      setForm(prev => ({ ...prev, cpf: formatted }));
    } else if (id === 'phone') {
      setForm(prev => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setForm(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setOk('');
    try {
      const requiredFields = ['full_name', 'phone', 'cpf', 'address'];
      for (const f of requiredFields) {
        if (!form[f] || String(form[f]).trim() === '') {
          throw new Error('Preencha todos os campos obrigatórios.');
        }
      }

      const { User } = await import('@/api/entities_new');
      let avatarUrl = form.avatar_url;
      if (avatarFile) {
        try {
          const { localApi } = await import('@/api/localApi');
          const up = await localApi.uploadFile(avatarFile);
          if (up?.url) {
            avatarUrl = up.url;
            setAvatarPreview(avatarUrl);
          }
        } catch (e) { console.error('Falha no upload do avatar', e); }
      }
      const cpfNumbers = form.cpf.replace(/\D/g, "");
      const phoneDigits = form.phone ? form.phone.replace(/\D/g, '') : '';
      await User.updateMyUserData({
        full_name: form.full_name,
        phone: phoneDigits,
        cpf: cpfNumbers,
        address: form.address,
        avatar_url: avatarUrl,
        plan_status: 'active',
        user_type: 'admin'
      });

      const updated = await User.me();
      const normalized = {
        full_name: updated?.full_name || '',
        phone: formatPhone(updated?.phone || ''),
        avatar_url: updated?.avatar_url || '',
        cpf: updated?.cpf ? updated.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : '',
        address: updated?.address || '',
        email: updated?.email || ''
      };
      setForm(normalized);
      setAvatarPreview(normalized.avatar_url);
      setOk('Perfil atualizado com sucesso.');
      setTimeout(() => navigateTo('AdminDashboard'), 800);
    } catch (e) {
      setError(e?.message || 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-700">
              <UserIcon className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">Meu Perfil (Admin)</CardTitle>
                <CardDescription>Atualize seus dados e mantenha o acesso ao painel.</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigateTo('AdminDashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          {error && <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-md">{error}</div>}
          {ok && <div className="p-3 bg-green-100 border border-green-200 text-green-700 text-sm rounded-md">{ok}</div>}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center flex-col gap-2">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Prévia do avatar" className="h-24 w-24 rounded-full object-cover border" />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-orange-100 text-orange-700 text-2xl">
                  {form.full_name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="w-full">
              <Label>Foto do Perfil</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setAvatarFile(f);
                  if (f) {
                    setAvatarPreview(URL.createObjectURL(f));
                  } else {
                    setAvatarPreview(form.avatar_url || "");
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input id="full_name" value={form.full_name} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input id="cpf" value={form.cpf} onChange={handleChange} maxLength={14} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone/WhatsApp *</Label>
              <Input id="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço Completo *</Label>
            <Input id="address" value={form.address} onChange={handleChange} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full fusion-gradient">
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
