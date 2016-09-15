(de main()
    (pool "app.db")
    (unless (seq *DB) (build) ) )

(de build ()
    (let Salt (gensalt)
         (new! '(+User) 'nm "admin" 'pw (hashpw "admin" Salt) 'slt Salt)))

(de go () (server 8088 "!home"))

(de home ()
    (redirect "/index.html"))


