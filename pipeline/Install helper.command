#!/bin/zsh
cd -- "${0:A:h}"
python3 install.py
result=$?
if (( result != 0 )); then printf '\nInstallation did not finish. See the message above.\n'; fi
printf '\nPress Return to close. '
read answer
exit $result
