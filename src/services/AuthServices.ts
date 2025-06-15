import { apiEndPoints } from 'src/AppConstants'
import { httpMethods, serviceMaker } from './ServiceWarpper'

export const LOGIN = (payload: any) => serviceMaker(`${apiEndPoints.LOGIN}`, httpMethods.POST, payload)
