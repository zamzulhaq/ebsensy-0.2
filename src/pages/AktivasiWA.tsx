import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import OTPInput from '../components/OTPInput'

type Step = 'INPUT_WA' | 'OTP' | 'VERIFYING' | 'SUCCESS'

const MOCK_OTP = '1234'

function mockKirimOTP(wa: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[MOCK] OTP ${MOCK_OTP} dikirim ke ${wa}`)
      resolve({ success: true })
    }, 1500)
  })
}

function mockVerifikasiOTP(kode: string): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: kode === MOCK_OTP })
    }, 1500)
  })
}

export default function AktivasiWA() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('INPUT_WA')
  const [wa, setWa] = useState('+62')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleKirimWA() {
    setError('')
    const cleaned = wa.replace(/\s/g, '')
    if (!/^\+62\d{8,15}$/.test(cleaned)) {
      setError('Nomor WA harus dimulai dengan +62 dan minimal 10 digit.')
      return
    }

    setMessage('Mengirim OTP...')
    const result = await mockKirimOTP(cleaned)
    if (!result.success) {
      setError('Gagal mengirim OTP. Silakan coba lagi.')
      setMessage('')
      return
    }

    setMessage('')
    setStep('OTP')
  }

  async function handleVerifikasiOTP() {
    if (otp.length !== 4) {
      setError('Masukkan kode OTP 4 digit.')
      return
    }

    setStep('VERIFYING')
    setError('')
    setMessage('Memverifikasi OTP...')

    const verif = await mockVerifikasiOTP(otp)
    if (!verif.success) {
      setError('Kode OTP salah. Silakan coba lagi.')
      setMessage('')
      setStep('OTP')
      setOtp('')
      return
    }

    setMessage('Mengaktifkan akun...')

    if (user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          status_aktivasi: 'AKTIF',
          whatsapp: wa.replace(/\s/g, ''),
        })
        .eq('id', user.id)

      if (updateError) {
        setError('Gagal menyimpan aktivasi. Silakan hubungi admin.')
        setMessage('')
        setStep('OTP')
        return
      }

      await refreshProfile()
    }

    setMessage('')
    setStep('SUCCESS')

    setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 1500)
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md shadow-indigo-100/50 p-8">
        {step === 'INPUT_WA' && (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 text-2xl">📱</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Verifikasi WhatsApp
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Masukkan nomor WhatsApp Anda untuk mengaktifkan akun
              </p>
              {profile && (
                <p className="text-xs text-slate-400 mt-2">
                  Halo, {profile.nama}
                </p>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={wa}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '' || val.startsWith('+62')) setWa(val)
                  }}
                  placeholder="+6281234567890"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm">
                  {message}
                </div>
              )}

              <button
                onClick={handleKirimWA}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer"
              >
                Kirim OTP
              </button>
            </div>
          </>
        )}

        {step === 'OTP' && (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 text-2xl">🔐</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Masukkan Kode OTP
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Kode 4 digit telah dikirim ke {wa}
              </p>
            </div>

            <div className="space-y-5">
              <OTPInput
                length={4}
                value={otp}
                onChange={setOtp}
                disabled={false}
              />

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm">
                  {message}
                </div>
              )}

              <button
                onClick={handleVerifikasiOTP}
                disabled={otp.length !== 4}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Verifikasi OTP
              </button>

              <button
                onClick={() => {
                  setStep('INPUT_WA')
                  setOtp('')
                  setError('')
                  setMessage('')
                }}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Ganti nomor WhatsApp
              </button>
            </div>
          </>
        )}

        {step === 'VERIFYING' && (
          <div className="text-center py-12">
            <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Memverifikasi...</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Aktivasi Berhasil!
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Mengalihkan ke dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
