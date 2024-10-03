import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { JwtPayload, jwtDecode } from 'jwt-decode';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> {
        return this.authService.loggedInUser.pipe(
            take(1),
            map(user => {
                if (!user) {
                    // If the user is not authenticated, redirect to login
                    return this.router.createUrlTree(['/login']);
                }

                const token = user.token;
                if (token) {
                    let decoded: any;
                    decoded = jwtDecode(token);
                   // const decoded: JwtPayload = jwtDecode(token);
                    const userRoles = decoded.groups || [];
                    const requiredRoles = route.data['role'] as string[];

                    // Check if the user has at least one of the required roles
                    const hasRequiredRole = requiredRoles
                        ? userRoles.some((role: string) => requiredRoles.includes(role))
                        : true; // If no roles are required, allow access

                    if (hasRequiredRole) {
                        return true; // Allow access
                    } else {
                        alert('You do not have permission to access this page.');
                        return this.router.createUrlTree(['/login']); // Redirect if no permission
                    }
                }

                return this.router.createUrlTree(['/login']); // Redirect if no token
            })
        );
    }
}











// import {
//     CanActivate,
//     ActivatedRouteSnapshot,
//     RouterStateSnapshot,
//     Router,
//     UrlTree
// } from '@angular/router';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { map, tap, take } from 'rxjs/operators';
// import { JwtPayload, jwtDecode } from "jwt-decode";

// import { AuthService } from './auth.service';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {

//     constructor(private authService: AuthService, private router: Router) { }

//     canActivate(
//         route: ActivatedRouteSnapshot,
//         router: RouterStateSnapshot
//     ):
//         | boolean
//         | UrlTree
//         | Promise<boolean | UrlTree>
//         | Observable<boolean | UrlTree> {
       
//         return this.authService.loggedInUser?.pipe(
//             take(1),
//             map(user => {
//                 //console.log(user.role);
//                 const isAuth = !!user;
//                 console.log(isAuth);
//                 const token = user?.token;
//                 if (token) {
//                     let decoded: any;
//                     decoded = jwtDecode(token);
//                     const groups = decoded.groups;
//                     console.log(groups);
//                     const requiredRoles = route.data['role'] as string[]; // Get required roles from route data
//                     console.log(requiredRoles);
                    
//                     if (isAuth) {
//                         if (requiredRoles && requiredRoles.length > 0) {
//                             const userRoles = groups as string[]; // Get user's roles from the user object
//                             // Check if the user has at least one of the required roles
//                             const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role));
//                             console.log(hasRequiredRole)
//                             if(hasRequiredRole){
//                                 return true;
//                             }
//                             else {
//                                 alert('You do not have permission to access this page.');
//                             }
//                         }
//                         else{
//                             return true 
//                         }
                        
//                     }
//                 }
//                 // else{
//                 //     return this.router.createUrlTree(['/auth']);
//                 // }

//                 return this.router.createUrlTree(['/login']);
//                 // }

//             })

//         );
//     }

// }




