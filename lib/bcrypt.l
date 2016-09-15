
# uses getrandom executable on windows since /dev/urandom is not available and RtlGenRandom is not fork-safe
(de getrandom-win (Len) 
    (pipe (exec 'getrandom Len)
          (make
           (until (eof) (link (read))) ) ) )


(de getrandom-posix (Len)
   (make 
    (in "/dev/urandom"
	(do Len 
	    (link (char (char))) ) ) ) )


(setq getrandom (if (= *CPU "win-x86-64") getrandom-win getrandom-posix))

# windows needs these defs because they need exported for GetProcAddress
(when (= *CPU "win-x86-64")
  (setq "mymalloc" "mymalloc")
  (setq "mybzero" "mybzero")
  (setq "myfree" "myfree") )

# set to be native versions
(unless (= *CPU "win-x86-64")
  (setq "mymalloc" "malloc")
  (setq "mybzero" "bzero")
  (setq "myfree" "free") )

(de gensalt ()
    (default *WorkFactor 12)
    (use (Hash Salt)
	 (setq Hash (native "@" "mymalloc" 'N 64))
         (setq Salt (getrandom 16))
         (native "bcrypt.so" "encode_salt" NIL Hash (cons NIL (16) Salt) 16 *WorkFactor)
	 (prog1
	     (struct Hash 'S)
	   (native "@" "myfree" NIL Hash)) ) )

(de hashpw (Passwd Salt)
    (use (HashPw Salt)
	 (setq HashPw (native "@" "mymalloc" 'N 128))
         (native "bcrypt.so" "pybc_bcrypt" NIL Passwd Salt HashPw 128)
	 (prog1
	     (struct HashPw 'S)
	   (native "@" "mybzero" NIL HashPw 128)
	   (native "@" "myfree" NIL HashPw) ) ) )

