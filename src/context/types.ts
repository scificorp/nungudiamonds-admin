export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type RegisterParams = {
  email: string
  username: string
  password: string
}

export type UserDataType = {
  id: number
  role: string
  email: string
  fullName: string
  username: string
  password: string
  avatar?: string | null
}

export type Tones = {
  id?: number
  name: string
}

export type GoldMetal = { 
    karat?: string,
    id_karat?: number, 
    tone: Tones[],
    price: string, 
    rate: number, 
    id: number, 
    metal_weight?: string, 
    metal_tone: any[] 
  }

export type PoductInquiryDetail = {
  full_name: string,
  email: string,
  product_id: number,
  contact_number: string,
  message: string,
  admin_action: number,
  admin_comments: string,
  product_name: string,
  product_sku: string,
  metal: string,
  Karat: number,
  Metal_tone: string,
  product_size: number,
  product_length: number
}



export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  register: (params: RegisterParams, errorCallback?: ErrCallbackType) => void
}
