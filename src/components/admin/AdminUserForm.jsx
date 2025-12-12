import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { User, Condominium } from '@/api/entities_new';

export default function AdminUserForm({ isOpen, onOpenChange, user, onSave }) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [condominiums, setCondominiums] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('student');

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
        setValue('address', data.logradouro || '');
        setValue('neighborhood', data.bairro || '');
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const loadCondos = async () => {
      try {
        const list = await Condominium.list();
        setCondominiums(list || []);
      } catch (e) {
        console.error('Erro ao carregar condomínios:', e);
      }
    };
    if (isOpen) loadCondos();
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setValue('full_name', user.full_name || '');
      setValue('email', user.email || '');
      setValue('phone', formatPhone(user.phone || ''));
      setValue('emergency_phone', formatPhone(user.emergency_phone || ''));
      setValue('cpf', user.cpf || '');
      setValue('date_of_birth', user.date_of_birth || '');
      setValue('block', user.block || '');
      setValue('apartment', user.apartment || '');
      setValue('cep', user.cep ? formatCep(user.cep) : '');
      setValue('address', user.address || '');
      setValue('address_number', user.address_number || '');
      setValue('neighborhood', user.neighborhood || '');
      setValue('condominium_id', user.condominium_id != null ? String(user.condominium_id) : '');
      setSelectedUserType(user.user_type || 'student');
    } else {
      reset();
      setSelectedUserType('student');
    }
  }, [user, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      const phoneDigits = data.phone ? data.phone.replace(/\D/g, '') : '';
      const payload = {
        full_name: data.full_name || '',
        email: user ? (user.email || '') : (data.email || ''),
        phone: phoneDigits,
        emergency_phone: data.emergency_phone ? data.emergency_phone.replace(/\D/g, '') : '',
        cpf: data.cpf || '',
        date_of_birth: data.date_of_birth || null,
        block: data.block || '',
        apartment: data.apartment || '',
        cep: data.cep ? data.cep.replace(/\D/g, '') : '',
        address: data.address || '',
        address_number: data.address_number || '',
        neighborhood: data.neighborhood || '',
        user_type: selectedUserType,
        condominium_id: data.condominium_id ? Number(data.condominium_id) : null,
      };

      if (user) {
        await User.update(user.id, payload);
      } else {
        const token = localStorage.getItem('fusion_token');
        await fetch('/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      }

      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription>Preencha os dados e salve</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input id="full_name" {...register('full_name')} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} disabled={!!user} />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              autoComplete="tel"
              {...register('phone')}
              onChange={(e) => setValue('phone', formatPhone(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="emergency_phone">Telefone de Emergencia</Label>
            <Input
              id="emergency_phone"
              autoComplete="tel"
              {...register('emergency_phone')}
              onChange={(e) => setValue('emergency_phone', formatPhone(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" {...register('cpf')} />
          </div>
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              {...register('cep')}
              maxLength={9}
              onChange={(e) => setValue('cep', formatCep(e.target.value))}
              onBlur={(e) => fetchAddressByCep(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="address_number">Número</Label>
              <Input id="address_number" {...register('address_number')} />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input id="neighborhood" {...register('neighborhood')} />
            </div>
          </div>
          <div>
            <Label htmlFor="date_of_birth">Data de Nascimento</Label>
            <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
          </div>

          <div>
            <Label htmlFor="user_type">Tipo de Usuário</Label>
            <Select value={selectedUserType} onValueChange={setSelectedUserType}>
              <SelectTrigger id="user_type">
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Aluno</SelectItem>
                <SelectItem value="instructor">Instrutor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedUserType === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="block">Bloco</Label>
                <Input id="block" {...register('block')} />
              </div>
              <div>
                <Label htmlFor="apartment">Apartamento</Label>
                <Input id="apartment" {...register('apartment')} />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="condominium_id">Condomínio</Label>
            <Select
              onValueChange={(value) => setValue('condominium_id', value)}
              defaultValue={user?.condominium_id != null ? String(user.condominium_id) : undefined}
            >
              <SelectTrigger id="condominium_id">
                <SelectValue placeholder="Selecione o condomínio" />
              </SelectTrigger>
              <SelectContent>
                {condominiums.map((condo) => (
                  <SelectItem key={condo.id} value={String(condo.id)}>
                    {condo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
